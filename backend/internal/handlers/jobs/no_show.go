package jobs

import (
	"context"
	"fmt"
	"log"
	"time"
	"toothtoday/internal/models"
	"toothtoday/services"

	"github.com/jackc/pgx/v5/pgxpool"
)

func notifyUpcomingAppointments(ctx context.Context, db *pgxpool.Pool) error {
	loc := time.FixedZone("Bangkok", 7*3600)
	now := time.Now().In(loc)

	type NotifyConfig struct {
		Before  time.Duration
		Message string
	}

	// 2 เงื่อนไข: 24 ชั่วโมง และ 1 ชั่วโมงก่อนนัด
	notifyConfigs := []NotifyConfig{
		{Before: 24 * time.Hour, Message: "📅 แจ้งเตือนล่วงหน้า: คุณมีคิวนัดหมายในอีก 24 ชั่วโมง อย่าลืมมาเช็คอินตรงเวลานะครับ 💙"},
		{Before: 1 * time.Hour, Message: "⏰ แจ้งเตือนล่วงหน้า: อีก 1 ชั่วโมงคุณมีคิวนัดกับ ToothToday \nโปรดเตรียมตัวมารับบริการ และเช็คอินไม่เกิน 10 นาทีก่อนเริ่มบริการ 💙"},
	}

	for _, cfg := range notifyConfigs {
		rows, err := db.Query(ctx, `
			SELECT a.id, a.user_id, a.appointment_time, a.duration_minutes,
			       d.name AS doctor_name, s.name AS service_name
			FROM appointments a
			JOIN doctors d ON a.doctor_id = d.id
			JOIN services s ON a.service_id = s.id
			WHERE a.status = 'pending'
			  AND a.appointment_time AT TIME ZONE 'Asia/Bangkok' >= $1 
		      AND a.appointment_time AT TIME ZONE 'Asia/Bangkok' < $2
			  
		`, now.Add(cfg.Before), now.Add(cfg.Before+time.Minute))
		// AND a.appointment_time AT TIME ZONE 'Asia/Bangkok' >= $1
		// AND a.appointment_time AT TIME ZONE 'Asia/Bangkok' < $2 //ใช้ range
		// AND a.appointment_time AT TIME ZONE 'Asia/Bangkok' = $1 // มันจะไม่ตรงเพราะ nanosec
		if err != nil {
			return err
		}

		for rows.Next() {
			var id, userID, dur int
			var appointmentTime time.Time
			var doctorName, serviceName string

			if err := rows.Scan(&id, &userID, &appointmentTime, &dur, &doctorName, &serviceName); err != nil {
				return err
			}

			lineID, _ := models.GetLineUserIDByUserID_job(ctx, userID)
			if lineID == "" {
				continue
			}

			date := appointmentTime.In(loc).Format("02/01/2006")
			start := appointmentTime.In(loc)
			end := start.Add(time.Duration(dur) * time.Minute)
			timeRange := fmt.Sprintf("%02d:%02d-%02d:%02d",
				start.Hour(), start.Minute(),
				end.Hour(), end.Minute(),
			)

			message := fmt.Sprintf("%s\n\n"+
				"👨‍⚕️ แพทย์: %s\n"+
				"🦷 บริการ: %s\n"+
				"📅 วันที่: %s\n"+
				"🕓 เวลา: %s\n\n"+
				"อย่าลืมเช็คอินก่อนถึงเวลานัดนะครับ 💙",
				cfg.Message, doctorName, serviceName, date, timeRange)

			go func(lineID, msg string) {
				_ = services.PushMessage(lineID, msg)
			}(lineID, message)

		}
		defer rows.Close()
	}

	return nil
}
func markNoShow(ctx context.Context, db *pgxpool.Pool) error {
	// loc, _ := time.LoadLocation("Asia/Bangkok")
	loc := time.FixedZone("Bangkok", 7*3600)

	now := time.Now().In(loc)
	rows, err := db.Query(ctx, `
        SELECT a.id, a.user_id, a.appointment_time, a.duration_minutes,
               d.name AS doctor_name, s.name AS service_name
        FROM appointments a
        JOIN doctors d ON a.doctor_id = d.id
        JOIN services s ON a.service_id = s.id
        WHERE date(a.appointment_time AT TIME ZONE 'Asia/Bangkok') = $1
          AND a.status = 'pending'
    `, now.Format("2006-01-02"))
	if err != nil {
		return err
	}
	defer rows.Close()
	for rows.Next() {
		var id, userID, dur int
		var appointmentTime time.Time
		var doctorName, serviceName string

		if err := rows.Scan(&id, &userID, &appointmentTime, &dur, &doctorName, &serviceName); err != nil {
			return err
		}
		appointmentTime = appointmentTime.In(loc)
		// ตรวจว่าเลยเวลา +10 นาที
		if now.After(appointmentTime.Add(10 * time.Minute)) {
			_, err := db.Exec(ctx, `
                UPDATE appointments
                SET status='no_show'
                WHERE id=$1
            `, id)
			if err != nil {
				return err
			}

			lineID, _ := models.GetLineUserIDByUserID_job(ctx, userID)
			if lineID != "" {
				date := appointmentTime.In(loc).Format("02/01/2006")
				start := appointmentTime.In(loc)
				end := start.Add(time.Duration(dur) * time.Minute)
				timeRange := fmt.Sprintf("%02d:%02d-%02d:%02d",
					start.Hour(), start.Minute(),
					end.Hour(), end.Minute(),
				)

				message := fmt.Sprintf("⚠️ คุณไม่ได้เช็คอินภายใน 10 นาที ระบบได้ยกเลิกคิวให้อัตโนมัติ\n\n"+
					"👨‍⚕️ แพทย์: %s\n"+
					"🦷 บริการ: %s\n"+
					"📅 วันที่: %s\n"+
					"🕓 เวลา: %s\n\n"+
					"หากต้องการจองคิวใหม่ สามารถทำได้ที่ ToothToday 💙",
					doctorName, serviceName, date, timeRange)

				go func(lineID, msg string) {
					_ = services.PushMessage(lineID, msg)
				}(lineID, message)
			}
		}
	}

	return nil

}
func markCompleted(ctx context.Context, db *pgxpool.Pool) error {
	loc := time.FixedZone("Bangkok", 7*3600)
	now := time.Now().In(loc)
	rows, err := db.Query(ctx, `
        SELECT id, user_id, appointment_time, duration_minutes
        FROM appointments
        WHERE status = 'in_progress'
    `)
	if err != nil {
		return err
	}
	defer rows.Close()

	for rows.Next() {
		var id int
		var userID int
		var start time.Time
		var duration int
		if err := rows.Scan(&id, &userID, &start, &duration); err != nil {
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
			// push LINE message
			lineID, _ := models.GetLineUserIDByUserID_job(ctx, userID)
			if lineID != "" {
				go func(lineID string) {
					_ = services.PushMessage(lineID, "คุณได้รับบริการเรียบร้อยแล้ว ขอบคุณที่ใช้บริการ ToothToday 💙")
				}(lineID)
			}
		}
	}

	return nil
}

func ScheduleNotifyJob(ctx context.Context, db *pgxpool.Pool) {
	loc := time.FixedZone("Bangkok", 7*3600)
	var lastHour int = -1
	for {
		now := time.Now().In(loc)

		// next := time.Date(
		// 	now.Year(),
		// 	now.Month(),
		// 	now.Day(),
		// 	now.Hour(),
		// 	0, 0, 0, loc,
		// )

		// if now.Minute() > 0 || now.Second() > 0 || now.Nanosecond() > 0 {
		// 	next = next.Add(time.Hour)
		// }
		if now.Minute() == 00 && lastHour != now.Hour() {
			fmt.Printf("[NotifyJob] Running notifyUpcomingAppointments at %v\n", now)
			if err := notifyUpcomingAppointments(ctx, db); err != nil {
				log.Println("Error notifying upcoming appointments:", err)
			} else {
				fmt.Printf("[NotifyJob] Completed notifyUpcomingAppointments at %v\n", time.Now().In(loc))
			}
			lastHour = now.Hour()
		}
		// sleepDuration := next.Sub(now)
		// fmt.Printf("Sleeping %v until next ScheduleNotifyJob run at %v\n", sleepDuration, next)
		// time.Sleep(sleepDuration)
		time.Sleep(1 * time.Second)

	}
}

// Scheduler run ทุกชั่วโมงที่ :10
func ScheduleNoShowJob(ctx context.Context, db *pgxpool.Pool) {
	loc := time.FixedZone("Bangkok", 7*3600)
	var lastHour int = -1
	for {
		now := time.Now().In(loc)
		// next := time.Date(
		// 	now.Year(),
		// 	now.Month(),
		// 	now.Day(),
		// 	now.Hour(),
		// 	23, 0, 0, loc,
		// )
		// if now.Minute() >= 10 {
		// 	next = next.Add(time.Hour)
		// }
		if now.Minute() >= 10 && lastHour != now.Hour() {
			fmt.Printf("[NoShowJob] Running markNoShow at %v\n", now)
			if err := markNoShow(ctx, db); err != nil {
				log.Println("Error marking No Show:", err)
			} else {
				fmt.Printf("[NoShowJob] Completed markNoShow at %v\n", time.Now().In(loc))
			}
			lastHour = now.Hour()
		}
		// sleepDuration := next.Sub(now)
		// fmt.Printf("Sleeping %v until next ScheduleNoShowJob run at %v\n", sleepDuration, next)
		// time.Sleep(sleepDuration)
		time.Sleep(1 * time.Second)

	}
}
func ScheduleCompleteJob(ctx context.Context, db *pgxpool.Pool) {
	// loc, _ := time.LoadLocation("Asia/Bangkok")
	loc := time.FixedZone("Bangkok", 7*3600)
	var lastHour int = -1
	for {
		now := time.Now().In(loc)
		// คำนวณเวลารันถัดไปทุกชั่วโมงตรง
		// next := time.Date(
		// 	now.Year(),
		// 	now.Month(),
		// 	now.Day(),
		// 	now.Hour(),
		// 	0, 0, 0, loc,
		// )
		// if now.Minute() == 00 && now.Second() >= 00 && now.Nanosecond() >= 00 {
		// 	next = next.Add(time.Hour)
		// }
		if now.Minute() == 00 && lastHour != now.Hour() {
			fmt.Printf("[CompletedJob] Running markCompleted at %v\n", now)
			if err := markCompleted(ctx, db); err != nil {
				log.Println("Error marking Completed:", err)
			} else {
				fmt.Printf("[CompletedJob] Completed markCompleted at %v\n", time.Now().In(loc))
			}
			lastHour = now.Hour()
		}
		// sleepDuration := next.Sub(now)
		// fmt.Printf("Sleeping %v until next ScheduleCompleteJob run at %v\n", sleepDuration, next)
		// time.Sleep(sleepDuration)
		time.Sleep(1 * time.Second)
	}
}
