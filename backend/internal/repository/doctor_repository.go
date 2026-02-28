package repository

import (
	"context"
	"toothtoday/internal/db"
	"toothtoday/internal/models"
)

func GetDoctors(ctx context.Context) ([]models.Doctor, error) {
	rows, err := db.Pool.Query(ctx,
		`SELECT id, name, specialization, schedule, image_url
		 FROM doctors 
		 WHERE is_delete = false`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var doctors []models.Doctor
	for rows.Next() {
		var d models.Doctor
		if err := rows.Scan(
			&d.ID,
			&d.Name,
			&d.Specialization,
			&d.Schedule,
			&d.ImageURL,
		); err != nil {
			return nil, err
		}
		doctors = append(doctors, d)
	}

	return doctors, nil
}

func GetDoctorsByWeekday(ctx context.Context, weekday int) (map[int]models.Doctor, error) {
	rows, err := db.Pool.Query(ctx, `
		select distinct d.id, d.name, d.specialization
		from doctors d
		join doctor_schedules ds on ds.doctor_id = d.id
		where ds.day_of_week = $1
	`, weekday)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	doctors := make(map[int]models.Doctor)
	for rows.Next() {
		var id int
		var name, specialization string
		if err := rows.Scan(&id, &name, &specialization); err != nil {
			continue
		}
		doctors[id] = models.Doctor{
			ID:             id,
			Name:           name,
			Specialization: specialization,
		}
	}

	return doctors, nil
}

func GetDoctorSchedules(ctx context.Context) ([]models.DoctorSchedules, error) {
	rows, err := db.Pool.Query(ctx,
		`SELECT id, doctor_id, day_of_week, start_time, end_time, slot_interval
		 FROM doctor_schedules`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var schedules []models.DoctorSchedules
	for rows.Next() {
		var s models.DoctorSchedules
		if err := rows.Scan(
			&s.ID,
			&s.DoctorID,
			&s.DayOfWeek,
			&s.StartTime,
			&s.EndTime,
			&s.SlotInterval,
		); err != nil {
			return nil, err
		}
		schedules = append(schedules, s)
	}

	return schedules, nil
}

func GetDoctorSchedulesByDay(ctx context.Context, dayOfWeek int) ([]models.DoctorSchedules, error) {
	query := `
		SELECT 
			ds.doctor_id,
			ds.start_time,
			ds.end_time,
			ds.slot_interval,
			d.name,
			d.specialization
		FROM doctor_schedules ds
		JOIN doctors d ON ds.doctor_id = d.id
		WHERE ds.day_of_week = $1
	`

	rows, err := db.Pool.Query(ctx, query, dayOfWeek)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var schedules []models.DoctorSchedules

	for rows.Next() {
		var s models.DoctorSchedules
		if err := rows.Scan(
			&s.DoctorID,
			&s.StartTime,
			&s.EndTime,
			&s.SlotInterval,
			&s.DoctorName,
			&s.Specialization,
		); err != nil {
			// continue
			return nil, err
		}
		schedules = append(schedules, s)
	}

	return schedules, nil
}

func CreateDoctorSchedule(ctx context.Context, s models.DoctorSchedules) (int, error) {
	query := `
		INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, slot_interval)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id
	`
	var id int
	err := db.Pool.QueryRow(
		ctx,
		query,
		s.DoctorID,
		s.DayOfWeek,
		s.StartTime,
		s.EndTime,
		s.SlotInterval,
	).Scan(&id)

	return id, err
}

func CreateDoctor(ctx context.Context, d models.Doctor) (int, error) {
	query := `
		INSERT INTO doctors (name, specialization, schedule, image_url, created_at, updated_at)
		VALUES ($1, $2, $3, $4, NOW(), NOW())
		RETURNING id
	`
	var id int
	err := db.Pool.QueryRow(
		ctx,
		query,
		d.Name,
		d.Specialization,
		d.Schedule,
		d.ImageURL,
	).Scan(&id)

	return id, err
}

func UpdateDoctor(ctx context.Context, id int, d models.Doctor, imagePath string) (int64, error) {
	query := `
		UPDATE doctors 
		SET name = COALESCE(NULLIF($1, ''), name),
			specialization = COALESCE(NULLIF($2, ''), specialization),
			schedule = COALESCE(NULLIF($3, ''), schedule),
			image_url = COALESCE(NULLIF($4, ''), image_url),
			updated_at = NOW()
		WHERE id = $5
	`

	result, err := db.Pool.Exec(ctx,
		query,
		d.Name,
		d.Specialization,
		d.Schedule,
		imagePath,
		id,
	)
	if err != nil {
		return 0, err
	}

	return result.RowsAffected(), nil
}

func SoftDeleteDoctor(ctx context.Context, doctorID int) (int64, error) {
	result, err := db.Pool.Exec(ctx,
		`UPDATE doctors 
		 SET is_delete = true, updated_at = NOW() 
		 WHERE id = $1`,
		doctorID,
	)
	if err != nil {
		return 0, err
	}

	return result.RowsAffected(), nil
}

func UpdateDoctorSchedule(ctx context.Context, id int, s models.DoctorSchedules) (int64, error) {
	query := `
		UPDATE doctor_schedules 
		SET day_of_week = COALESCE($1, day_of_week),
			start_time = COALESCE(NULLIF($2,'')::time, start_time),
			end_time = COALESCE(NULLIF($3,'')::time, end_time),
			slot_interval = COALESCE(NULLIF($4, 0), slot_interval),
			doctor_id = COALESCE(NULLIF($6, 0), doctor_id)
		WHERE id = $5
	`

	result, err := db.Pool.Exec(
		ctx,
		query,
		s.DayOfWeek,
		s.StartTime,
		s.EndTime,
		s.SlotInterval,
		id,
		s.DoctorID,
	)
	if err != nil {
		return 0, err
	}

	return result.RowsAffected(), nil
}

func DeleteDoctorSchedule(ctx context.Context, id int) (int64, error) {
	result, err := db.Pool.Exec(ctx,
		`DELETE FROM doctor_schedules WHERE id = $1`,
		id,
	)
	if err != nil {
		return 0, err
	}

	return result.RowsAffected(), nil
}

func UpdateDoctorScheduleByID(
	ctx context.Context,
	id int,
	dayOfWeek int,
	startTime string,
	endTime string,
	slotInterval int,
	doctorID int,
) (int64, error) {

	query := `
		UPDATE doctor_schedules 
		SET day_of_week = COALESCE($1, day_of_week),
			start_time = COALESCE(NULLIF($2,'')::time, start_time),
			end_time = COALESCE(NULLIF($3,'')::time, end_time),
			slot_interval = COALESCE(NULLIF($4, 0), slot_interval),
			doctor_id = COALESCE(NULLIF($6, 0), doctor_id)
		WHERE id = $5
	`

	result, err := db.Pool.Exec(
		ctx,
		query,
		dayOfWeek,
		startTime,
		endTime,
		slotInterval,
		id,
		doctorID,
	)
	if err != nil {
		return 0, err
	}

	return result.RowsAffected(), nil
}

func DeleteDoctorScheduleByID(ctx context.Context, id int) (int64, error) {
	result, err := db.Pool.Exec(ctx, `
        DELETE FROM doctor_schedules 
        WHERE id = $1
    `, id)
	if err != nil {
		return 0, err
	}

	return result.RowsAffected(), nil
}
