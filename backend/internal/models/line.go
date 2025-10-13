package models

import (
	"context"
	"fmt"
	"toothtoday/internal/db"

	"github.com/gin-gonic/gin"
)

type LineTokenResponse struct {
	AccessToken  string `json:"access_token"`
	IDToken      string `json:"id_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int    `json:"expires_in"`
	TokenType    string `json:"token_type"`
}
type LineIDTokenClaims struct {
	Sub     string `json:"sub"`
	Name    string `json:"name"`    // Display name
	Picture string `json:"picture"` // Picture URL
}

func LinkLineUser(c *gin.Context, webUserID int, lineUserID string, lineName string, linePicture string) error {
	_, err := db.Pool.Exec(c, `
	update users set line_user_id=$1, line_display_name=$2, line_picture_url=$3, updated_at=now() 
	where id=$4
	`, lineUserID, lineName, linePicture, webUserID)
	if err != nil {
		return fmt.Errorf("failed to link LINE user: %v", err)
	}
	return nil
}
func GetLineUserIDByUserID(c *gin.Context, userID int) (string, error) {
	var lineUserID string
	err := db.Pool.QueryRow(c, `SELECT line_user_id FROM users WHERE id=$1`, userID).Scan(&lineUserID)
	if err != nil {
		return "", err
	}
	return lineUserID, nil
}
func GetLineUserIDByUserID_job(ctx context.Context, userID int) (string, error) {
	var lineID string
	err := db.Pool.QueryRow(ctx, `SELECT line_user_id FROM users WHERE id=$1`, userID).Scan(&lineID)
	if err != nil {
		return "", err
	}
	return lineID, nil
}
