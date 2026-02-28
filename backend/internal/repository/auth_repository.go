package repository

import (
	"context"
	"toothtoday/internal/db"
)

func CreateUser(ctx context.Context, name, email, passwordHash, phone string) (int, error) {
	var userID int
	err := db.Pool.QueryRow(ctx, `
		INSERT INTO users (name, email, password_hash, phone, role)
		VALUES ($1, $2, $3, $4, 'user')
		RETURNING id
	`, name, email, passwordHash, phone).Scan(&userID)

	if err != nil {
		return 0, err
	}
	return userID, nil
}

func GetUserByEmail(ctx context.Context, email string) (int, string, string, error) {
	var id int
	var passwordHash string
	var role string

	err := db.Pool.QueryRow(ctx, `
		SELECT id, password_hash, role 
		FROM users 
		WHERE LOWER(email) = LOWER($1)
	`, email).Scan(&id, &passwordHash, &role)

	if err != nil {
		return 0, "", "", err
	}

	return id, passwordHash, role, nil
}
