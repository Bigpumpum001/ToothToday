package handlers

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"strings"
	"toothtoday/internal/db"
	"toothtoday/internal/models"
	"toothtoday/services"

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

	decodedStateBytes, err := base64.StdEncoding.DecodeString(state)
	if err != nil {
		c.String(http.StatusBadRequest, "Invalid state (base64 decode failed)")
		return
	}
	// unmarshal JSON
	var stateData struct {
		UserID int `json:"user_id"`
	}
	err = json.Unmarshal(decodedStateBytes, &stateData)
	if err != nil {
		c.String(http.StatusBadRequest, "Invalid state")
		return
	}

	// แลก token กับ LINE
	tokenResp, err := getLineAccessToken(code)
	if err != nil {
		c.String(http.StatusInternalServerError, "Token exchange failed")
		return
	}
	fmt.Println("ID Token:", tokenResp.IDToken)

	// ดึง LINE userID จาก ID Token
	claims, err := parseIDToken(tokenResp.IDToken)
	if err != nil {
		c.String(http.StatusInternalServerError, "Failed to parse ID Token")
		return
	}

	webUserID := stateData.UserID //getCurrentWebUserID(c)

	if webUserID == 0 {
		c.String(http.StatusUnauthorized, "User not authenticated")
		return
	}
	// บันทึกลง DB
	err = models.LinkLineUser(c, webUserID, claims.Sub, claims.Name, claims.Picture)
	if err != nil {
		c.String(http.StatusInternalServerError, "Failed to link LINE account")
		return
	}
	var Name, Email string
	if err := db.Pool.QueryRow(c, `SELECT name, email FROM users WHERE id = $1`, webUserID).Scan(&Name, &Email); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch user"})
		return
	}
	go func() {
		err := services.PushMessage(claims.Sub, fmt.Sprintf("✅ บัญชี LINE นี้เชื่อมกับ\nผู้ใช้: %s \n Email : %s", Name, Email))
		if err != nil {
			fmt.Println("Push message failed:", err)
		}
	}()

	c.Redirect(http.StatusFound, feURL+"/profile")
}

func UnlinkLineAccount(c *gin.Context) {
	userID := getCurrentWebUserID(c)
	var Name, Email, LineUserID string
	if err := db.Pool.QueryRow(c, `SELECT name, email,line_user_id FROM users WHERE id = $1`, userID).Scan(&Name, &Email, &LineUserID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch user"})
		return
	}
	_, err := db.Pool.Exec(c, `
		UPDATE users SET line_user_id=NULL, line_display_name=NULL, line_picture_url = NULL, updated_at = now() WHERE id = $1
	`, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to unlink line"})
		return
	}

	go func() {
		err := services.PushMessage(LineUserID, fmt.Sprintf("⚠️ ยกเลิกการเชื่อมต่อบัญชี LINE กับ\nผู้ใช้: %s \n Email : %s", Name, Email))
		if err != nil {
			fmt.Println("Push message failed:", err)
		}
	}()
	c.JSON(http.StatusOK, gin.H{"message": "ยกเลิกการเชื่อมต่อไลน์แล้ว"})
}

func getLineAccessToken(code string) (*models.LineTokenResponse, error) {
	values := url.Values{}
	values.Add("grant_type", "authorization_code")
	values.Add("code", code)
	values.Add("redirect_uri", os.Getenv("LINE_LOGIN_REDIRECT_URI"))
	values.Add("client_id", os.Getenv("LINE_LOGIN_CHANNEL_ID"))
	values.Add("client_secret", os.Getenv("LINE_LOGIN_CHANNEL_SECRET"))
	resp, err := http.PostForm("https://api.line.me/oauth2/v2.1/token", values)

	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	var tokenResp models.LineTokenResponse
	if err := json.Unmarshal(body, &tokenResp); err != nil {
		return nil, err
	}
	return &tokenResp, nil
}
func parseIDToken(idToken string) (*models.LineIDTokenClaims, error) {
	parts := strings.Split(idToken, ".")
	if len(parts) < 2 {
		return nil, fmt.Errorf("invalid ID Token")
	}
	payloadStr := parts[1]
	// เติม padding
	if m := len(payloadStr) % 4; m != 0 {
		payloadStr += strings.Repeat("=", 4-m)
	}

	payload, err := base64.URLEncoding.DecodeString(payloadStr)
	// payload, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return nil, err
	}
	fmt.Println("Decoded payload:", string(payload))

	var claims models.LineIDTokenClaims
	if err := json.Unmarshal(payload, &claims); err != nil {
		return nil, err
	}

	return &claims, nil
}
func getCurrentWebUserID(c *gin.Context) int {
	userID, exists := c.Get("user_id")

	if !exists {
		return 0
	}
	return userID.(int)
}
