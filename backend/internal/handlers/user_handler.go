package handlers

import (
	"net/http"
	"toothtoday/internal/models"
	"toothtoday/internal/services"

	"github.com/gin-gonic/gin"
)

func GetUsers(c *gin.Context) {
	users, err := services.GetUsers(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "DB error"})
		return
	}
	c.JSON(http.StatusOK, users)
}
func GetProfile(c *gin.Context) {
	userID := c.GetInt("user_id")
	response, err := services.GetProfile(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	c.JSON(http.StatusOK, response)
}

// PUT /users/me
func UpdateProfile(c *gin.Context) {
	userID := c.GetInt("user_id")
	var input models.User

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	user, err := services.UpdateProfile(
		c.Request.Context(),
		userID,
		input,
	)

	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, user)
}
