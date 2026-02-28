package repository

import (
	"context"
	"fmt"
	"time"
	"toothtoday/internal/db"
	"toothtoday/internal/models"
)

func GetUsers(ctx context.Context) ([]models.User, error) {
	rows, err := db.Pool.Query(ctx, "SELECT id,name,phone,age,role,email FROM users")
	if err != nil {
		return nil, fmt.Errorf("DB error %w", err)
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var u models.User
		if err := rows.Scan(&u.ID, &u.Name, &u.Phone, &u.Age, &u.Role, &u.Email); err != nil {
			return nil, fmt.Errorf("DB scan error: %w", err)
		}
		users = append(users, u)
	}
	return users, nil
}
func GetProfileUser(ctx context.Context, userID int) (models.User, error) {

	var user models.User

	err := db.Pool.QueryRow(ctx, `
	select name,email,role,phone,chronic_disease,age,line_user_id,line_display_name,line_picture_url from users where id=$1
	`, userID).Scan(&user.Name, &user.Email, &user.Role, &user.Phone, &user.ChronicDisease, &user.Age, &user.LineUserID, &user.LineDisplayName, &user.LinePictureUrl)

	return user, err
}
func GetUsersAppointment(ctx context.Context, userID int) ([]models.ProfileAppointment, error) {

	rows, err := db.Pool.Query(ctx,
		`SELECT a.id, a.appointment_time, a.status, a.image_url, a.duration_minutes,
                d.name as doctor_name, s.name as service_name,a.note
        FROM appointments a
        JOIN doctors d ON a.doctor_id = d.id
        JOIN services s ON a.service_id = s.id
        WHERE a.user_id=$1 AND a.is_delete = false
        ORDER BY a.appointment_time ASC`,
		userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var appointments []models.ProfileAppointment

	for rows.Next() {
		var a models.ProfileAppointment
		var start time.Time
		var duration int
		if err := rows.Scan(&a.ID, &start, &a.Status, &a.ImageURL, &duration, &a.DoctorName, &a.ServiceName, &a.Note); err != nil {
			continue
		}
		a.StartTime = start
		a.Duration = duration
		appointments = append(appointments, a)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return appointments, nil
}

// PUT /users/me
func UpdateProfile(ctx context.Context, input models.User) (models.User, error) {

	_, err := db.Pool.Exec(ctx,
		`UPDATE users 
         SET name=$1, email=$2, phone=$3, chronic_disease=$4, age=$5 
         WHERE id=$6`,
		input.Name, input.Email, input.Phone, input.ChronicDisease, input.Age, input.ID,
	)
	if err != nil {
		return models.User{}, err
	}

	return input, nil
}
