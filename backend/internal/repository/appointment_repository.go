package repository

import (
	"context"
	"log"
	"time"
	"toothtoday/internal/db"
	"toothtoday/internal/models"
)

func CreateAppointment(ctx context.Context, userID, doctorID, serviceID int,
	appointmentTime any, status string, note *string, imageURL *string, dur int,
) (int, error) {

	var id int
	err := db.Pool.QueryRow(ctx, `
		INSERT INTO appointments 
		(user_id, doctor_id, service_id, appointment_time, status, note, image_url, duration_minutes)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
		RETURNING id
	`, userID, doctorID, serviceID, appointmentTime, status, note, imageURL, dur).Scan(&id)

	return id, err
}

func GetAppointmentsByUserID(ctx context.Context, userID string) ([]models.Appointment, error) {
	rows, err := db.Pool.Query(ctx, `
		SELECT id, user_id, doctor_id, service_id, appointment_time, status, note, image_url
		FROM appointments
		WHERE user_id=$1
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var appointments []models.Appointment
	for rows.Next() {
		var a models.Appointment
		if err := rows.Scan(
			&a.ID,
			&a.UserID,
			&a.DoctorID,
			&a.ServiceID,
			&a.AppointmentTime,
			&a.Status,
			&a.Note,
			&a.ImageURL,
		); err != nil {
			return nil, err
		}

		a.AppointmentTime = a.AppointmentTime.In(db.Loc)
		appointments = append(appointments, a)
	}

	return appointments, nil
}

func GetAppointmentsByDate(ctx context.Context, dateStr string) ([]models.Appointment, error) {
	rows, err := db.Pool.Query(ctx, `
		select id, user_id, doctor_id, service_id, appointment_time, status, note, image_url, duration_minutes
		from appointments
		where date(appointment_time AT TIME ZONE 'Asia/Bangkok') = $1 
		and status in ('pending','in_progress','confirm','booking')
		order by appointment_time asc
	`, dateStr)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var appts []models.Appointment
	for rows.Next() {
		var a models.Appointment
		if err := rows.Scan(
			&a.ID,
			&a.UserID,
			&a.DoctorID,
			&a.ServiceID,
			&a.AppointmentTime,
			&a.Status,
			&a.Note,
			&a.ImageURL,
			&a.DurationMinutes,
		); err != nil {
			continue
		}
		appts = append(appts, a)
	}

	return appts, nil
}

func GetAppointmentsByDoctorAndDate(ctx context.Context, doctorID int, date string) ([]models.Appointment, error) {
	// ไม่ใช้ 'pending','confirm'แล้ว ใช้ booking แทน
	rows, err := db.Pool.Query(ctx, `
	select appointment_time,duration_minutes
	FROM appointments
	where doctor_id = $1
	and date(appointment_time AT TIME ZONE 'Asia/Bangkok') = $2
	and status in ('pending','confirm','booking')
	order by appointment_time asc
	`, doctorID, date)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []models.Appointment
	for rows.Next() {
		var a models.Appointment
		if err := rows.Scan(&a.AppointmentTime, &a.DurationMinutes); err != nil {
			return nil, err
		}
		result = append(result, a)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return result, nil
}

func GetAppointmentsForAdmin(ctx context.Context, date time.Time) ([]models.AppointmentForAdmin, error) {
	query := `
		SELECT 
			a.id,
			u.name as user_name,
			d.name as doctor_name,
			s.name as service_name,
			s.duration_minutes,
			a.appointment_time,
			a.status,
			a.note,
			a.image_url
		FROM appointments a
		LEFT JOIN users u ON a.user_id = u.id
		LEFT JOIN doctors d ON a.doctor_id = d.id
		LEFT JOIN services s ON a.service_id = s.id
		WHERE DATE(a.appointment_time) = $1
		ORDER BY a.appointment_time ASC
	`

	rows, err := db.Pool.Query(ctx, query, date)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var appointments []models.AppointmentForAdmin

	for rows.Next() {
		var a models.AppointmentForAdmin
		err := rows.Scan(
			&a.ID,
			&a.UserName,
			&a.DoctorName,
			&a.ServiceName,
			&a.DurationMinutes,
			&a.AppointmentTime,
			&a.Status,
			&a.Note,
			&a.ImageURL,
		)
		if err != nil {
			log.Printf("Error scanning appointment row: %v", err)
			continue
		}

		appointments = append(appointments, a)
	}

	return appointments, nil
}

func GetUserRole(ctx context.Context, userID int) (string, error) {
	var role string
	err := db.Pool.QueryRow(ctx, `
		SELECT role FROM users WHERE id=$1
	`, userID).Scan(&role)
	return role, err
}

func CountActiveAppointments(ctx context.Context, userID int) (int, error) {
	var count int
	err := db.Pool.QueryRow(ctx, `
		SELECT count(*) 
		FROM appointments 
		WHERE user_id=$1 
		AND status IN ('pending','confirm','in_progress')
	`, userID).Scan(&count)
	return count, err
}

func GetServiceDuration(ctx context.Context, serviceID int) (int, error) {
	var dur int
	err := db.Pool.QueryRow(ctx, `
		SELECT duration_minutes 
		FROM services 
		WHERE id=$1
	`, serviceID).Scan(&dur)
	return dur, err
}

func GetDoctorAndServiceName(ctx context.Context, doctorID, serviceID int) (string, string, error) {
	var doctorName, serviceName string
	err := db.Pool.QueryRow(ctx, `
		SELECT d.name, s.name
		FROM doctors d
		JOIN services s ON s.id = $1
		WHERE d.id = $2
	`, serviceID, doctorID).Scan(&doctorName, &serviceName)

	return doctorName, serviceName, err
}

func GetAppointmentDetailByIDAndUser(
	ctx context.Context,
	appointmentID int,
	userID int,
) (*models.AppointmentDetail, error) {

	var result models.AppointmentDetail

	err := db.Pool.QueryRow(ctx, `
		SELECT d.name, s.name, a.appointment_time, a.duration_minutes
		FROM appointments a
		JOIN doctors d ON a.doctor_id = d.id
		JOIN services s ON a.service_id = s.id
		WHERE a.id = $1 AND a.user_id = $2
	`, appointmentID, userID).
		Scan(
			&result.DoctorName,
			&result.ServiceName,
			&result.AppointmentTime,
			&result.DurationMinutes,
		)

	if err != nil {
		return nil, err
	}

	return &result, nil
}

func UpdateAppointmentStatus(
	ctx context.Context,
	appointmentID int,
	status string,
) (int64, error) {

	query := `
		UPDATE appointments 
		SET status = COALESCE(NULLIF($1, ''), status),
			updated_at = NOW()
		WHERE id = $2
	`

	result, err := db.Pool.Exec(ctx, query, status, appointmentID)
	if err != nil {
		return 0, err
	}

	return result.RowsAffected(), nil
}

func DeleteAppointmentByIDAndUser(
	ctx context.Context,
	appointmentID int,
	userID int,
) (int64, error) {
	result, err := db.Pool.Exec(ctx, `
		DELETE FROM appointments
		WHERE id = $1 AND user_id = $2
	`, appointmentID, userID)

	if err != nil {
		return 0, err
	}

	return result.RowsAffected(), nil
}

func DeleteAppointmentByIDForAdmin(
	ctx context.Context,
	appointmentID int,
) (int64, error) {
	result, err := db.Pool.Exec(ctx, `
		DELETE FROM appointments
		WHERE id = $1
	`, appointmentID)

	if err != nil {
		return 0, err
	}

	return result.RowsAffected(), nil
}
