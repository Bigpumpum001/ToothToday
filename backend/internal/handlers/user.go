package handlers

import (
	"net/http"
	"toothtoday/internal/db"

	"github.com/gin-gonic/gin"
)

type User struct {
	ID    int    `json:id`
	Name  string `json:name`
	Phone string `json:phone`
}

func GetUsers(c *gin.Context) {
	rows, err := db.Pool.Query(c, "SELECT id,name,phone FROM users")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "DB error"})
		return
	}
	defer rows.Close()

	users := []User{}
	for rows.Next() {
		var u User
		rows.Scan(&u.ID, &u.Name, &u.Phone)
		users = append(users, u)
	}
	c.JSON(http.StatusOK, users)
}
