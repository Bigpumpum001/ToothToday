package repository

import (
	"context"
	"toothtoday/internal/db"
)

// ดึง name + email (ใช้ตอน push message)
func GetUserBasicInfo(ctx context.Context, userID int) (string, string, error) {
	var name, email string
	err := db.Pool.QueryRow(ctx,
		`SELECT name, email FROM users WHERE id = $1`,
		userID,
	).Scan(&name, &email)

	return name, email, err
}

// ผูก LINE account
func LinkLineUser(ctx context.Context, webUserID int, lineUserID string, lineName string, linePicture string) error {
	_, err := db.Pool.Exec(ctx, `
		UPDATE users 
		SET line_user_id=$1, line_display_name=$2, line_picture_url=$3, updated_at=now()
		WHERE id=$4
	`, lineUserID, lineName, linePicture, webUserID)

	return err
}

// ยกเลิกการเชื่อม LINE
func UnlinkLineUser(ctx context.Context, userID int) (string, string, string, error) {
	var name, email, lineUserID string

	err := db.Pool.QueryRow(ctx,
		`SELECT name, email, line_user_id FROM users WHERE id = $1`,
		userID,
	).Scan(&name, &email, &lineUserID)

	if err != nil {
		return "", "", "", err
	}

	_, err = db.Pool.Exec(ctx, `
		UPDATE users 
		SET line_user_id=NULL, line_display_name=NULL, line_picture_url=NULL, updated_at=now()
		WHERE id=$1
	`, userID)

	if err != nil {
		return "", "", "", err
	}

	return name, email, lineUserID, nil
}

func GetLineUserIDByUserID(ctx context.Context, userID int) (string, error) {
	var lineUserID string
	err := db.Pool.QueryRow(ctx,
		`SELECT line_user_id FROM users WHERE id=$1`,
		userID,
	).Scan(&lineUserID)

	return lineUserID, err
}
func GetLineUserIDByUserID_job(ctx context.Context, userID int) (string, error) {
	var lineID string
	err := db.Pool.QueryRow(ctx, `SELECT line_user_id FROM users WHERE id=$1`, userID).Scan(&lineID)
	if err != nil {
		return "", err
	}
	return lineID, nil
}
