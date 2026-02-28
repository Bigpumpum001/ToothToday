package repository

import (
	"context"
	"time"
	"toothtoday/internal/models"

	"github.com/jackc/pgx/v5/pgxpool"
)

func GetUpcomingAppointmentsBetween(ctx context.Context, db *pgxpool.Pool, startTime, endTime time.Time) ([]models.Appointment, error) {
	rows, err := db.Query(ctx, `
			SELECT a.id, a.user_id, a.appointment_time, a.duration_minutes,
			       d.name AS doctor_name, s.name AS service_name
			FROM appointments a
			JOIN doctors d ON a.doctor_id = d.id
			JOIN services s ON a.service_id = s.id
			WHERE a.status = 'pending'
			  AND a.appointment_time  >= $1 
		      AND a.appointment_time  < $2
		`, startTime, endTime)

	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var list []models.Appointment
	for rows.Next() {
		var a models.Appointment
		if err := rows.Scan(
			&a.ID,
			&a.UserID,
			&a.AppointmentTime,
			&a.DurationMinutes,
			&a.DoctorName,
			&a.ServiceName,
		); err != nil {
			return nil, err
		}
		// fmt.Printf("✅ Found appointment: ID=%d, UserID=%d, Time=%s, Duration=%d, Doctor=%s, Service=%s\n",
		// 	id, userID, appointmentTime.Format(time.RFC3339), dur, doctorName, serviceName)
		list = append(list, a)
	}

	return list, nil

}

// ใช้สำหรับ MarkNoShow
func GetTodayPendingAppointments(ctx context.Context, db *pgxpool.Pool, now string) ([]models.Appointment, error) {
	rows, err := db.Query(ctx, `
        SELECT a.id, a.user_id, a.appointment_time, a.duration_minutes,
               d.name AS doctor_name, s.name AS service_name
        FROM appointments a
        JOIN doctors d ON a.doctor_id = d.id
        JOIN services s ON a.service_id = s.id
        WHERE date(a.appointment_time AT TIME ZONE 'Asia/Bangkok') = $1
          AND a.status = 'pending'
    `, now)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []models.Appointment
	for rows.Next() {
		var a models.Appointment
		if err := rows.Scan(
			&a.ID,
			&a.UserID,
			&a.AppointmentTime,
			&a.DurationMinutes,
			&a.DoctorName,
			&a.ServiceName,
		); err != nil {
			return nil, err
		}
		list = append(list, a)
	}

	return list, nil
}

// ใช้สำหรับ MarkCompleted
func GetInProgressAppointments(ctx context.Context, db *pgxpool.Pool) ([]models.Appointment, error) {
	rows, err := db.Query(ctx, `
        SELECT id, user_id, appointment_time, duration_minutes
        FROM appointments
        WHERE status = 'in_progress'
    `)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []models.Appointment
	for rows.Next() {
		var a models.Appointment
		if err := rows.Scan(
			&a.ID,
			&a.UserID,
			&a.AppointmentTime,
			&a.DurationMinutes,
		); err != nil {
			return nil, err
		}
		list = append(list, a)
	}

	return list, nil
}

func UpdateNoShow(ctx context.Context, db *pgxpool.Pool, id int) error {
	_, err := db.Exec(ctx, `
        UPDATE appointments
        SET status='no_show'
        WHERE id=$1
    `, id)
	return err
}

func UpdateComplete(ctx context.Context, db *pgxpool.Pool, id int) error {
	_, err := db.Exec(ctx, `
        UPDATE appointments
        SET status='complete'
        WHERE id=$1
    `, id)
	return err
}
