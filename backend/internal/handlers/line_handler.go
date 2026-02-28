package handlers

import (
	"net/http"
	"os"
	"toothtoday/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/line/line-bot-sdk-go/linebot"
)

var Bot *linebot.Client

func LineLoginCallback(c *gin.Context) {
	feURL := os.Getenv("FRONTEND_URL")
	code := c.Query("code")
	if code == "" {
		c.String(http.StatusBadRequest, "Missing Code")
		return
	}
	state := c.Query("state")
	if state == "" {
		c.String(http.StatusBadRequest, "Missing State")
		return
	}

	_, err := services.HandleLineLoginCallback(
		c.Request.Context(),
		code,
		state,
	)

	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	c.Redirect(http.StatusFound, feURL+"/profile")
}

func UnlinkLineAccount(c *gin.Context) {
	userID := c.GetInt("user_id")
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	err := services.HandleUnlinkLine(
		c.Request.Context(),
		userID,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to unlink line"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "ยกเลิกการเชื่อมต่อไลน์แล้ว"})
}
