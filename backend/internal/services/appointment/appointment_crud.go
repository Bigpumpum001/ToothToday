package appointment

import (
	"context"
	"errors"
	"fmt"
	"strconv"
	"time"
	"toothtoday/internal/clients"
	"toothtoday/internal/db"
	"toothtoday/internal/models"
	"toothtoday/internal/repository"
)

var (
	ErrInvalidInput  = errors.New("invalid input")
	ErrAlreadyBooked = errors.New("already booked")
)

func GetAppointmentsByUser(
	ctx context.Context,
	userID string,
) ([]models.Appointment, error) {

	return repository.GetAppointmentsByUserID(ctx, userID)
}

func GetDoctorSlots(
	ctx context.Context,
	serviceID int,
	date string,
) ([]models.Slot, error) {

	service, err := repository.GetServiceByID(ctx, serviceID)
	if err != nil {
		return nil, err
	}

	if date != "" {
		return GenerateSlotsByDate(ctx, date, service.Duration_minutes), nil
	}

	defaultDate := time.Now().In(db.Loc).Format("2006-01-02")
	return GenerateSlotsForAllDoctor(ctx, defaultDate, service.Duration_minutes), nil
}

func CreateAppointment(
	ctx context.Context,
	input models.CreateAppointmentInput,
) (*models.CreateAppointmentResult, error) {

	// check role
	role, err := repository.GetUserRole(ctx, input.UserID)
	if err != nil {
		return nil, fmt.Errorf("get user role: %w", err)
	}

	if role != "admin" {
		count, err := repository.CountActiveAppointments(ctx, input.UserID)
		if err != nil {
			return nil, fmt.Errorf("count active appointments: %w", err)
		}
		if count > 0 {
			return nil, ErrAlreadyBooked
		}
	}

	// get duration
	dur, err := repository.GetServiceDuration(ctx, input.ServiceID)
	if err != nil {
		return nil, fmt.Errorf("get service duration: %w", err)
	}

	var imageURL *string
	dbImagePath := ""
	// upload file (optional)
	if input.FileHeader != nil {
		filename := input.FileHeader.Filename
		objectPath := fmt.Sprintf("images/appointment/%s", filename)

		if err := clients.UploadFile(input.FileHeader, objectPath); err != nil {
			return nil, err
		}

		dbImagePath = "/" + objectPath
	}

	imageURL = &dbImagePath

	// insert DB
	_, err = repository.CreateAppointment(
		ctx,
		input.UserID,
		input.DoctorID,
		input.ServiceID,
		input.AppointmentTime,
		"pending",
		&input.Note,
		imageURL,
		dur,
	)
	if err != nil {
		return nil, fmt.Errorf("create appointment: %w", err)
	}

	// fetch doctor + service name
	doctorName, serviceName, err :=
		repository.GetDoctorAndServiceName(ctx, input.DoctorID, input.ServiceID)
	if err != nil {
		return nil, fmt.Errorf("get doctor/service: %w", err)
	}

	// format time range
	start := input.AppointmentTime.In(db.Loc)
	end := start.Add(time.Duration(dur) * time.Minute)

	timeRange := fmt.Sprintf("%02d:%02d-%02d:%02d",
		start.Hour(), start.Minute(),
		end.Hour(), end.Minute(),
	)

	date := input.AppointmentTime.In(db.Loc).Format("02/01/2006")
	publicURL := ""
	// if dbImagePath != "" {
	if imageURL != nil && *imageURL != "" {
		publicURL = clients.GetFileURL(*imageURL)
	}
	go func() {
		lineID, err := repository.GetLineUserIDByUserID(context.Background(), input.UserID)
		if err != nil {
			fmt.Println("GetLineUserID error:", err)
			return
		}
		if lineID == "" {
			fmt.Println("User has no linked LINE account, skipping push.")
			return
		}
		if err :=
			clients.PushMessage(lineID, fmt.Sprintf("🎉 จองคิวสำเร็จแล้ว!\n\n"+
				"👨‍⚕️ แพทย์: %s\n"+
				"🦷 บริการ %s\n"+
				"📅 วันที่: %s\n"+
				"🕓 เวลา: %s\n\n"+
				"ขอบคุณที่ใช้บริการ ToothToday 💙",
				doctorName, serviceName, date, timeRange)); err != nil {
			fmt.Println("PushMessage failed:", err)
		}

	}()
	return &models.CreateAppointmentResult{
		DoctorName:  doctorName,
		ServiceName: serviceName,
		Date:        date,
		TimeRange:   timeRange,
		PublicURL:   publicURL,
	}, nil
}

func DeleteAppointment(
	ctx context.Context,
	userID int,
	appointmentID int,
) error {

	detail, err := repository.GetAppointmentDetailByIDAndUser(
		ctx,
		appointmentID,
		userID,
	)
	if err != nil {
		return err
	}

	rowsAffected, err := repository.DeleteAppointmentByIDAndUser(
		ctx,
		appointmentID,
		userID,
	)
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return fmt.Errorf("not found")
	}

	date := detail.AppointmentTime.In(db.Loc).Format("02/01/2006")

	start := detail.AppointmentTime.In(db.Loc)
	end := start.Add(time.Duration(detail.DurationMinutes) * time.Minute)

	timeRange := fmt.Sprintf("%02d:%02d-%02d:%02d",
		start.Hour(), start.Minute(),
		end.Hour(), end.Minute(),
	)

	go func() {
		lineID, err := repository.GetLineUserIDByUserID(context.Background(), userID)
		if err != nil {
			fmt.Println("GetLineUserID error:", err)
			return
		}
		if lineID == "" {
			fmt.Println("User has no linked LINE account, skipping push.")
			return
		}
		if err :=
			clients.PushMessage(lineID, fmt.Sprintf("❌ ยกเลิกคิวแล้ว!\n\n"+
				"👨‍⚕️ แพทย์: %s\n"+
				"🦷 บริการ %s\n"+
				"📅 วันที่: %s\n"+
				"🕓 เวลา: %s\n\n"+
				"ขอบคุณที่ใช้บริการ ToothToday 💙",
				detail.DoctorName, detail.ServiceName, date, timeRange)); err != nil {
			fmt.Println("PushMessage failed:", err)
		}

	}()

	return nil
}

func GetAppointmentsForAdmin(
	ctx context.Context,
	dateStr string,
) ([]models.AppointmentForAdmin, error) {

	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		return nil, fmt.Errorf("invalid date format")
	}

	rows, err := repository.GetAppointmentsForAdmin(ctx, date)
	if err != nil {
		return nil, err
	}

	for i := range rows {
		endTime := rows[i].AppointmentTime.Add(
			time.Duration(rows[i].DurationMinutes) * time.Minute,
		)

		rows[i].TimeRange = fmt.Sprintf("%s - %s",
			rows[i].AppointmentTime.In(db.Loc).Format("15:04"),
			endTime.In(db.Loc).Format("15:04"),
		)
	}

	return rows, nil
}
func UpdateAppointmentStatus(
	ctx context.Context,
	appointmentIDStr string,
	status string,
) (int64, error) {

	appointmentID, err := strconv.Atoi(appointmentIDStr)
	if err != nil {
		return 0, fmt.Errorf("invalid appointment ID")
	}

	validStatuses := map[string]bool{
		"pending":     true,
		"confirm":     true,
		"in_progress": true,
		"complete":    true,
		// "cancelled":   true,
		"no_show": true,
	}

	if !validStatuses[status] {
		return 0, fmt.Errorf("invalid status")
	}

	return repository.UpdateAppointmentStatus(
		ctx,
		appointmentID,
		status,
	)
}

func DeleteAppointmentForAdmin(
	ctx context.Context,
	appointmentIDStr string,
) (int64, error) {

	appointmentID, err := strconv.Atoi(appointmentIDStr)
	if err != nil {
		return 0, fmt.Errorf("invalid appointment ID")
	}

	return repository.DeleteAppointmentByIDForAdmin(
		ctx,
		appointmentID,
	)
}
