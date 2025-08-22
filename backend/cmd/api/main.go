package main

import (
	"fmt"
	"toothtoday/internal/db"
	"toothtoday/internal/handlers"

	"github.com/gin-gonic/gin"
)

func main() {
	db.Connect()
	r := gin.Default()

	r.GET("/hello", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Hello from ToothToday API",
		})
	})
	fmt.Println("Server running on http://localhost:8080")
	r.Run(":8080")

	r.GET("/users", handlers.GetUsers)
}
