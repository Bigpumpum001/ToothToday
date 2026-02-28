package services

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"strings"
	"toothtoday/internal/clients"
	"toothtoday/internal/models"
	"toothtoday/internal/repository"
)

func HandleLineLoginCallback(
	ctx context.Context,
	code string,
	state string,
) (int, error) {

	// decode state
	decodedStateBytes, err := base64.StdEncoding.DecodeString(state)
	if err != nil {
		return 0, fmt.Errorf("invalid state (base64 decode failed)")
	}

	var stateData struct {
		UserID int `json:"user_id"`
	}

	if err := json.Unmarshal(decodedStateBytes, &stateData); err != nil {
		return 0, fmt.Errorf("invalid state json")
	}

	if stateData.UserID == 0 {
		return 0, fmt.Errorf("User not unauthorized")
	}

	// exchange token
	tokenResp, err := getLineAccessToken(code)
	if err != nil {
		return 0, err
	}

	claims, err := parseIDToken(tokenResp.IDToken)
	if err != nil {
		return 0, err
	}

	// link DB
	err = repository.LinkLineUser(
		ctx,
		stateData.UserID,
		claims.Sub,
		claims.Name,
		claims.Picture,
	)
	if err != nil {
		return 0, err
	}

	// push message async
	name, email, err := repository.GetUserBasicInfo(ctx, stateData.UserID)

	if err == nil {
		go func() {
			if err := clients.PushMessage(
				claims.Sub,
				fmt.Sprintf("✅ บัญชี LINE นี้เชื่อมกับ\nผู้ใช้: %s \n Email : %s", name, email),
			); err != nil {
				fmt.Println("push failed:", err)
			}
		}()
	}

	return stateData.UserID, nil
}

func HandleUnlinkLine(
	ctx context.Context,
	userID int,
) error {

	name, email, lineUserID, err := repository.UnlinkLineUser(ctx, userID)
	if err != nil {
		return err
	}

	go func() {
		if err := clients.PushMessage(
			lineUserID,
			fmt.Sprintf("⚠️ ยกเลิกการเชื่อมต่อบัญชี LINE กับ\nผู้ใช้: %s \n Email : %s", name, email),
		); err != nil {
			fmt.Println("Push message failed:", err)
		}
	}()

	return nil
}

// =====================
// internal helpers
// =====================

func getLineAccessToken(code string) (*models.LineTokenResponse, error) {

	values := url.Values{}
	values.Add("grant_type", "authorization_code")
	values.Add("code", code)
	values.Add("redirect_uri", os.Getenv("LINE_LOGIN_REDIRECT_URI"))
	values.Add("client_id", os.Getenv("LINE_LOGIN_CHANNEL_ID"))
	values.Add("client_secret", os.Getenv("LINE_LOGIN_CHANNEL_SECRET"))

	resp, err := http.PostForm(
		"https://api.line.me/oauth2/v2.1/token",
		values,
	)
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
		return nil, fmt.Errorf("invalid id token")
	}

	payloadStr := parts[1]
	if m := len(payloadStr) % 4; m != 0 {
		payloadStr += strings.Repeat("=", 4-m)
	}

	payload, err := base64.URLEncoding.DecodeString(payloadStr)
	if err != nil {
		return nil, err
	}

	var claims models.LineIDTokenClaims
	if err := json.Unmarshal(payload, &claims); err != nil {
		return nil, err
	}

	return &claims, nil
}
