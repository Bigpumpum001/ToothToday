package services

import (
	"context"
	"fmt"
	"time"
	"toothtoday/internal/clients"
	"toothtoday/internal/repository"

	"github.com/jackc/pgx/v5/pgxpool"
)

func NotifyUpcomingAppointments(ctx context.Context, db *pgxpool.Pool) error {
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
		startTime := now.Add(cfg.Before - 1*time.Minute).UTC()
		endTime := now.Add(cfg.Before + 2*time.Minute).UTC()
		fmt.Printf("\n[%s]\n", cfg.Message)
		fmt.Println("start,end", startTime, endTime)
		fmt.Printf(" Now: %s\n", now.Format(time.RFC3339))
		fmt.Printf(" Checking appointments between %s and %s (UTC)\n",
			startTime.Format(time.RFC3339), endTime.Format(time.RFC3339),
		)
		appointments, err := repository.GetUpcomingAppointmentsBetween(ctx, db, startTime, endTime)
		if err != nil {
			return err
		}

		for _, ap := range appointments {

			lineID, _ := repository.GetLineUserIDByUserID_job(ctx, ap.UserID)
			if lineID == "" {
				continue
			}

			date := ap.AppointmentTime.In(loc).Format("02/01/2006")
			start := ap.AppointmentTime.In(loc)
			end := start.Add(time.Duration(ap.DurationMinutes) * time.Minute)
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
				cfg.Message, ap.DoctorName, ap.ServiceName, date, timeRange)

			go func(lineID, msg string) {
				_ = clients.PushMessage(lineID, msg)
			}(lineID, message)

		}

	}

	return nil
}
func MarkNoShow(ctx context.Context, db *pgxpool.Pool) error {
	// loc, _ := time.LoadLocation("Asia/Bangkok")
	loc := time.FixedZone("Bangkok", 7*3600)

	now := time.Now().In(loc)
	appointments, err := repository.GetTodayPendingAppointments(
		ctx,
		db,
		now.Format("2006-01-02"),
	)
	if err != nil {
		return err
	}
	for _, ap := range appointments {
		appointmentTime := ap.AppointmentTime.In(loc)

		// เลยเวลา + 10 นาที = no show
		if now.After(appointmentTime.Add(10 * time.Minute)) {
			if err := repository.UpdateNoShow(ctx, db, ap.ID); err != nil {
				return err
			}

			lineID, _ := repository.GetLineUserIDByUserID_job(ctx, ap.UserID)
			if lineID == "" {
				continue
			}

			date := appointmentTime.Format("02/01/2006")
			start := appointmentTime
			end := start.Add(time.Duration(ap.DurationMinutes) * time.Minute)

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
				ap.DoctorName, ap.ServiceName, date, timeRange)

			go func(lineID, msg string) {
				_ = clients.PushMessage(lineID, msg)
			}(lineID, message)
		}
	}

	return nil

}
func MarkCompleted(ctx context.Context, db *pgxpool.Pool) error {
	loc := time.FixedZone("Bangkok", 7*3600)
	now := time.Now().In(loc)
	appointments, err := repository.GetInProgressAppointments(ctx, db)
	if err != nil {
		return err
	}

	for _, ap := range appointments {
		endTime := ap.AppointmentTime.Add(time.Duration(ap.DurationMinutes) * time.Minute)

		if now.After(endTime) {
			if err := repository.UpdateComplete(ctx, db, ap.ID); err != nil {
				return err
			}
			// push LINE message
			lineID, _ := repository.GetLineUserIDByUserID_job(ctx, ap.UserID)
			if lineID != "" {
				go func(lineID string) {
					_ = clients.PushMessage(lineID, "คุณได้รับบริการเรียบร้อยแล้ว ขอบคุณที่ใช้บริการ ToothToday 💙")
				}(lineID)
			}
		}
	}

	return nil
}
