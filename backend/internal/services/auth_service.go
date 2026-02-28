package services

import (
	"context"
	"os"
	"time"
	"toothtoday/internal/db"
	"toothtoday/internal/models"
	"toothtoday/internal/repository"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

var jwtSecret = []byte(os.Getenv("JWT_SECRET"))

func Register(
	ctx context.Context,
	req models.RegisterRequest,
) (models.AuthResponse, error) {

	hash, err := bcrypt.GenerateFromPassword(
		[]byte(req.Password),
		bcrypt.DefaultCost,
	)
	if err != nil {
		return models.AuthResponse{}, err
	}

	userID, err := repository.CreateUser(
		ctx,
		req.Name,
		req.Email,
		string(hash),
		req.Phone,
	)
	if err != nil {
		return models.AuthResponse{}, err
	}

	tokenString, err := generateJWT(userID, "user")
	if err != nil {
		return models.AuthResponse{}, err
	}

	return models.AuthResponse{
		UserID: userID,
		Token:  tokenString,
	}, nil
}

func Login(
	ctx context.Context,
	req models.LoginRequest,
) (models.AuthResponse, error) {

	id, passwordHash, role, err := repository.GetUserByEmail(
		ctx,
		req.Email,
	)
	if err != nil {
		return models.AuthResponse{}, err
	}

	if err := bcrypt.CompareHashAndPassword(
		[]byte(passwordHash),
		[]byte(req.Password),
	); err != nil {
		return models.AuthResponse{}, err
	}

	tokenString, err := generateJWT(id, role)
	if err != nil {
		return models.AuthResponse{}, err
	}

	return models.AuthResponse{
		UserID: id,
		Token:  tokenString,
	}, nil
}

// =====================
// internal helper
// =====================

func generateJWT(userID int, role string) (string, error) {

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": userID,
		"role":    role,
		"exp":     time.Now().In(db.Loc).Add(7 * 24 * time.Hour).Unix(),
	})

	return token.SignedString(jwtSecret)
}
