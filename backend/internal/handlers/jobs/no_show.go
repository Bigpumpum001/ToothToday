package jobs

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

func markNoShow(ctx context.Context, db *pgxpool.Pool) error {
	now := time.Now()

	rows, err := db.Query(ctx, `
        SELECT id, appointment_time
        FROM appointments
        WHERE date(appointment_time) = $1
          AND status = 'pending'
    `, now.Format("2006-01-02"))
	if err != nil {
		return err
	}
	defer rows.Close()
	for rows.Next() {
		var id int
		var t time.Time
		if err := rows.Scan(&id, &t); err != nil {
			return err
		}
		if now.After(t.Add(10 * time.Minute)) {
			_, err := db.Exec(ctx, `
                UPDATE appointments
                SET status='no_show'
                WHERE id=$1
            `, id)
			if err != nil {
				return err
			}
		}
	}
	return nil

}
func markCompleted(ctx context.Context, db *pgxpool.Pool) error {
	now := time.Now()

	rows, err := db.Query(ctx, `
        SELECT id, appointment_time, duration_minutes
        FROM appointments
        WHERE status = 'in_progress'
    `)
	if err != nil {
		return err
	}
	defer rows.Close()

	for rows.Next() {
		var id int
		var start time.Time
		var duration int
		if err := rows.Scan(&id, &start, &duration); err != nil {
			return err
		}

		endTime := start.Add(time.Duration(duration) * time.Minute)
		if now.After(endTime) {
			_, err := db.Exec(ctx, `
                UPDATE appointments
                SET status='complete'
                WHERE id=$1
            `, id)
			if err != nil {
				return err
			}
		}
	}

	return nil
}

// Scheduler run ทุกชั่วโมงที่ :10
func ScheduleNoShowJob(ctx context.Context, db *pgxpool.Pool) {
	for {
		now := time.Now()
		next := time.Date(
			now.Year(),
			now.Month(),
			now.Day(),
			now.Hour(),
			10, 0, 0, now.Location(),
		)
		if now.Minute() >= 10 {
			next = next.Add(time.Hour) // ข้ามไปชั่วโมงถัดไป
		}

		sleepDuration := next.Sub(now)
		fmt.Printf("Sleeping %v until next ScheduleNoShowJob run at %v\n", sleepDuration, next)
		time.Sleep(sleepDuration)

		if err := markNoShow(ctx, db); err != nil {
			log.Println("Error marking No Show:", err)
		}
	}
}
func ScheduleCompleteJob(ctx context.Context, db *pgxpool.Pool) {
	for {
		now := time.Now()
		// คำนวณเวลารันถัดไปทุกชั่วโมงตรง
		next := time.Date(
			now.Year(),
			now.Month(),
			now.Day(),
			now.Hour(),
			0, 0, 0, now.Location(),
		)
		if now.Minute() > 0 || now.Second() > 0 {
			// ข้ามไปชั่วโมงถัดไป
			next = next.Add(time.Hour)
		}

		sleepDuration := next.Sub(now)
		fmt.Printf("Sleeping %v until next ScheduleCompleteJob run at %v\n", sleepDuration, next)
		time.Sleep(sleepDuration)

		if err := markCompleted(ctx, db); err != nil {
			log.Println("Error marking Completed:", err)
		}
	}
}
