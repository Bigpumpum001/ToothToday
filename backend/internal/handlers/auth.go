package handlers

import (
	"net/http"
	"os"
	"time"
	"toothtoday/internal/db"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

var jwtSecret = []byte(os.Getenv("JWT_SECRET"))

func Register(c *gin.Context) {
	var req struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Password string `json:"password"`
		Phone    string `json:"phone"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	hash, _ := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	var userID int
	err := db.Pool.QueryRow(c, `
	insert into users (name,email,password_hash,phone,role)
	values ($1,$2,$3,$4,'user') returning id 
	`, req.Name, req.Email, string(hash), req.Phone).Scan(&userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": userID,
		"role":    "user",
		"exp":     time.Now().In(db.Loc).Add(7 * 24 * time.Hour).Unix(),
	})
	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to sign token"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"user_id": userID, "token": tokenString})
}

func Login(c *gin.Context) {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	var id int
	var passwordHash, role string
	err := db.Pool.QueryRow(c, `
	select id,password_hash, role from users where email = $1
	`, req.Email).Scan(&id, &passwordHash, &role)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User not found"})
		return
	}
	if err := bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(req.Password)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Password"})
		return
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": id,
		"role":    role,
		"exp":     time.Now().In(db.Loc).Add(7 * 24 * time.Hour).Unix(),
	})
	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to sign token"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"user_id": id, "token": tokenString})
}

//ยังไม่ได้ืทำ
// func GoogleLogin(c *gin.Context) {
// 	var req struct {
// 		IdToken string `json:"id_token"`
// 	}
// 	if err := c.ShouldBindJSON(&req); err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
// 		return
// 	}
// 	payload, err := idtoken.Validate(c, req.IdToken, "YOUR_GOOGLE_CLIENT_ID")
// 	if err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid token"})
// 		return
// 	}
// 	email := payload.Claims["email"].(string)
// 	name := payload.Claims["name"].(string)
// 	googleID := payload.Claims["sub"].(string)

// 	var id int
// 	var role string
// 	err := db.Pool.QueryRow(c, `
// 	select id,role from users where email=$1
// 	`, email).Scan(&id, &role)

// 	if err != nil {
// 		err := db.Pool.QueryRow(c, `
// 		insert into users (name,email,google_id,role) values ($1,$2,$3,'user') returning id
// 		`, name, email, googleID).Scan(&id)
// 		role = "user"
// 	}
// 	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
// 		"user_id": id,
// 		"role":    role,
// 		"exp":     time.Now().Add(7 * 24 * time.Hour).Unix(),
// 	})
// 	tokenString, err := token.SignedString(jwtSecret)
// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to sign token"})
// 		return
// 	}
// 	c.JSON(http.StatusOK, gin.H{"user_id": id, "token": tokenString})
// }
