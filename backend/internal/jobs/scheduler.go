package jobs

import (
	"context"
	"fmt"
	"log"
	"time"
	"toothtoday/internal/services"

	"github.com/jackc/pgx/v5/pgxpool"
)

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
			fmt.Printf("[NotifyJob] Running NotifyUpcomingAppointments at %v\n", now)
			if err := services.NotifyUpcomingAppointments(ctx, db); err != nil {
				log.Println("Error notifying upcoming appointments:", err)
			} else {
				fmt.Printf("[NotifyJob] Completed NotifyUpcomingAppointments at %v\n", time.Now().In(loc))
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
			fmt.Printf("[NoShowJob] Running MarkNoShow at %v\n", now)
			if err := services.MarkNoShow(ctx, db); err != nil {
				log.Println("Error marking No Show:", err)
			} else {
				fmt.Printf("[NoShowJob] Completed MarkNoShow at %v\n", time.Now().In(loc))
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
			fmt.Printf("[CompletedJob] Running MarkCompleted at %v\n", now)
			if err := services.MarkCompleted(ctx, db); err != nil {
				log.Println("Error marking Completed:", err)
			} else {
				fmt.Printf("[CompletedJob] Completed MarkCompleted at %v\n", time.Now().In(loc))
			}
			lastHour = now.Hour()
		}
		// sleepDuration := next.Sub(now)
		// fmt.Printf("Sleeping %v until next ScheduleCompleteJob run at %v\n", sleepDuration, next)
		// time.Sleep(sleepDuration)
		time.Sleep(1 * time.Second)
	}
}
