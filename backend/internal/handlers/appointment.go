package handlers

import (
	"context"
	"fmt"
	"net/http"
	"sort"
	"strconv"
	"strings"
	"time"
	"toothtoday/internal/db"
	"toothtoday/internal/models"
	"toothtoday/internal/storage"
	"toothtoday/services"

	"github.com/gin-gonic/gin"
)

// http://localhost:8080/api/appointment?user_id=1
func GetAppointment(c *gin.Context) {
	userID := c.Query("user_id")
	rows, err := db.Pool.Query(c, `
	SELECT id, user_id, doctor_id, service_id, appointment_time, status, note, image_url
		FROM appointments
		WHERE user_id=$1
	`, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "DB error"})
		return
	}
	defer rows.Close()
	var appointments []models.Appointment
	for rows.Next() {
		var a models.Appointment
		if err := rows.Scan(&a.ID, &a.UserID, &a.DoctorID, &a.ServiceID, &a.AppointmentTime, &a.Status, &a.Note, &a.ImageURL); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		a.AppointmentTime = a.AppointmentTime.In(db.Loc)
		appointments = append(appointments, a)
	}

	c.JSON(http.StatusOK, appointments)
}

// GET/api/appointment/slots?serviceId=$X
// GET/api/appointment/slots?serviceId=$X&date=YYYY-MM-DD
// ไม่จำเปนต้องมี get /appointment/slots?serviceId=$X&date=YYYY-MM-DD&serviceId=$X
func GetDoctorSlots(c *gin.Context) {
	serviceIDStr := c.Query("serviceId")
	if serviceIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "serviceId required"})
		return
	}

	serviceID, err := strconv.Atoi(serviceIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid serviceId"})
		return
	}

	service, err := models.GetServiceByID(serviceID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "service not found"})
		return
	}

	date := c.Query("date")
	// doctorIDStr := c.Query("doctorId")

	var slots []models.Slot
	switch {
	//กรณีมี doctor + date
	// case doctorIDStr != "" && date != "":
	// 	doctorID, err := strconv.Atoi(doctorIDStr)
	// 	if err != nil {
	// 		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid doctorId"})
	// 		return
	// 	}
	// 	slots = generateSlotsForDoctor(doctorID, date, service.Duration_minutes)
	case date != "":
		slots = generateSlotsForAllDoctor(date, service.Duration_minutes)
	default:
		defaultDate := time.Now().In(db.Loc).Format("2006-01-02")
		slots = generateSlotsForAllDoctor(defaultDate, service.Duration_minutes)
	}
	c.JSON(http.StatusOK, slots)
}

// http://localhost:8080/api/appointment/booked?doctorId=1&date=2025-08-25
func GetBookedSlots(c *gin.Context) {
	doctorIDStr := c.Query("doctorId")
	date := c.Query("date") // yyyy-mm-dd
	if doctorIDStr == "" || date == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "doctorID and date are required"})
		return
	}
	doctorID, err := strconv.Atoi(doctorIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid doctorId"})
		return
	}
	slotMap, err := getBookedSlotsMap(c.Request.Context(), doctorID, date)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	}
	var slots []string
	for s := range slotMap {
		slots = append(slots, s)
	}
	sort.Strings(slots)

	c.JSON(http.StatusOK, slots)
}
func getBookedSlotsMap(ctx context.Context, doctorID int, date string) (map[string]bool, error) {
	// ไม่ใช้ 'pending','confirmed'แล้ว ใช้ booking แทน
	rows, err := db.Pool.Query(ctx, `
	select appointment_time,duration_minutes
	FROM appointments
	where doctor_id = $1
	and date(appointment_time AT TIME ZONE 'Asia/Bangkok') = $2
	and status in ('pending','confirmed','booking')
	order by appointment_time asc
	`, doctorID, date)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	slotMap := make(map[string]bool)
	for rows.Next() {
		var t time.Time
		var durationMinutes int
		if err := rows.Scan(&t, &durationMinutes); err != nil {
			return nil, err
		}
		slotsToBlock := (durationMinutes + 59) / 60
		for i := 0; i < slotsToBlock; i++ {
			// fmt.Println("slotsToBlock", slotsToBlock)
			slotTime := t.In(db.Loc).Add(time.Duration(i) * time.Hour).Format("15:04")
			// fmt.Printf("DEBUG book slot > %s\n (duration %d)", slotTime, durationMinutes)
			slotMap[slotTime] = true
		}
	}

	return slotMap, nil
}

// GET /api/appointment/availability?month=2025-08
func GetMonthAvailability(c *gin.Context) {
	month := c.Query("month") // YYYY/MM
	yearMonth := strings.Split(month, "-")
	if len(yearMonth) != 2 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid month format"})
		return
	}
	year, _ := strconv.Atoi(yearMonth[0])
	monthInt, _ := strconv.Atoi(yearMonth[1])

	availability := generateMonthAvailability(year, monthInt)
	if availability.Days == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot generate availablity"})
		return
	}
	c.JSON(http.StatusOK, availability)
}

// POST /api/appointment/book
func CreateAppointment(c *gin.Context) {
	var a models.Appointment
	userIDStr := c.PostForm("user_id")
	doctorIDStr := c.PostForm("doctor_id")
	serviceIDStr := c.PostForm("service_id")
	appointmentTimeStr := c.PostForm("appointment_time")
	status := c.PostForm("status")
	note := c.PostForm("note")

	userID, _ := strconv.Atoi(userIDStr)
	doctorID, _ := strconv.Atoi(doctorIDStr)
	serviceID, _ := strconv.Atoi(serviceIDStr)

	appointmentTime, err := time.Parse(time.RFC3339, appointmentTimeStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid appointment_time"})
		return
	}

	a.UserID = userID
	a.DoctorID = doctorID
	a.ServiceID = serviceID
	a.AppointmentTime = appointmentTime
	a.Note = &note
	a.Status = status

	if a.UserID == 0 || a.DoctorID == 0 || a.ServiceID == 0 || a.AppointmentTime.IsZero() || a.Status == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing required field"})
		return
	}

	var role string
	if err := db.Pool.QueryRow(c, `select role from users where id=$1`, a.UserID).Scan(&role); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch user role"})
		return
	}
	if role != "admin" {
		var count int
		if err := db.Pool.QueryRow(c, `
		select count(*) from appointments where user_id=$1 and status in ('pending','confirm','in_progress')
		`, a.UserID).Scan(&count); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to check existing appointments"})
			return
		}
		if count > 0 {
			c.JSON(http.StatusForbidden, gin.H{"error": "คุณได้จองแล้ว ไม่สามารถจองเพิ่มได้"})
			return
		}
	}

	var dur int
	if err := db.Pool.QueryRow(c, `
		select duration_minutes from services
		where id = $1
	`, a.ServiceID).Scan(&dur); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch service duration"})
		return
	}
	a.DurationMinutes = dur

	// default image path
	dbImagePath := ""

	fileHeader, err := c.FormFile("file")
	if err == nil && fileHeader != nil {
		filename := fileHeader.Filename
		objectPath := fmt.Sprintf("images/appointment/%s", filename)
		if err := storage.UploadFile(fileHeader, objectPath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Upload failed"})
			return
		}
		dbImagePath = "/" + objectPath
		// fmt.Println("อัปโหลดรูปสำเร็จ")
	}
	a.ImageURL = &dbImagePath

	row := db.Pool.QueryRow(c, `
		INSERT INTO appointments (user_id, doctor_id, service_id, appointment_time, status, note, image_url, duration_minutes)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id
	`, a.UserID, a.DoctorID, a.ServiceID, a.AppointmentTime, "pending", a.Note, a.ImageURL, dur)

	if err := row.Scan(&a.ID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to insert appointment"})
		return
	}

	// fetch doctor name + service name
	var doctorName, serviceName string
	if err := db.Pool.QueryRow(c, `
		SELECT d.name, s.name
		FROM doctors d
		JOIN services s ON s.id = $1
		WHERE d.id = $2
	`, a.ServiceID, a.DoctorID).Scan(&doctorName, &serviceName); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch doctor/service info"})
		return
	}

	// calculate time range
	start := a.AppointmentTime.In(db.Loc)
	end := start.Add(time.Duration(a.DurationMinutes) * time.Minute)
	timeRange := fmt.Sprintf("%02d:%02d-%02d:%02d",
		start.Hour(), start.Minute(),
		end.Hour(), end.Minute(),
	)
	date := a.AppointmentTime.In(db.Loc).Format("02/01/2006")

	publicURL := ""
	// if dbImagePath != "" {
	if a.ImageURL != nil && *a.ImageURL != "" {
		publicURL = storage.GetFileURL(*a.ImageURL)

	}
	go func() {
		lineID, err := models.GetLineUserIDByUserID(c, userID)
		if err != nil {
			fmt.Println("GetLineUserID error:", err)
			return
		}
		if lineID == "" {
			fmt.Println("User has no linked LINE account, skipping push.")
			return
		}
		if err :=
			services.PushMessage(lineID, fmt.Sprintf("🎉 จองคิวสำเร็จแล้ว!\n\n"+
				"👨‍⚕️ แพทย์: %s\n"+
				"🦷 บริการ %s\n"+
				"📅 วันที่: %s\n"+
				"🕓 เวลา: %s\n\n"+
				"ขอบคุณที่ใช้บริการ ToothToday 💙",
				doctorName, serviceName, date, timeRange)); err != nil {
			fmt.Println("PushMessage failed:", err)
		}

	}()
	// c.JSON(http.StatusOK, a)
	c.JSON(http.StatusOK, gin.H{
		"doctor":     gin.H{"id": a.DoctorID, "name": doctorName},
		"service":    gin.H{"id": a.ServiceID, "name": serviceName},
		"date":       date,
		"time_range": timeRange,
		"image_url":  publicURL,
	})

}

func DeleteAppointment(c *gin.Context) {
	userID := c.GetInt("user_id")
	// fmt.Println("userID", userID)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid appointment ID"})
		return
	}
	// fmt.Println("Deleting appointment ID:", id, "for user:", userID)
	var doctorName, serviceName string
	var appointmentTime time.Time
	var dur int
	if err := db.Pool.QueryRow(c, `
	select d.name , s.name, a.appointment_time,a.duration_minutes
	from appointments a
	join doctors d on a.doctor_id = d.id
	join services s on a.service_id = s.id
	where a.id = $1 and a.user_id = $2
	`, id, userID).Scan(&doctorName, &serviceName, &appointmentTime, &dur); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch user"})
		return
	}
	date := appointmentTime.In(db.Loc).Format("02/01/2006")
	start := appointmentTime.In(db.Loc)
	end := start.Add(time.Duration(dur) * time.Minute)
	timeRange := fmt.Sprintf("%02d:%02d-%02d:%02d",
		start.Hour(), start.Minute(),
		end.Hour(), end.Minute(),
	)

	result, err := db.Pool.Exec(c, `
        DELETE FROM appointments 
        WHERE id = $1 AND user_id = $2
    `, id, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete appointment"})
		return
	}
	rowsAffected := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Appointment not found"})
		return
	}
	go func() {
		lineID, err := models.GetLineUserIDByUserID(c, userID)
		if err != nil {
			fmt.Println("GetLineUserID error:", err)
			return
		}
		if lineID == "" {
			fmt.Println("User has no linked LINE account, skipping push.")
			return
		}
		if err :=
			services.PushMessage(lineID, fmt.Sprintf("❌ ยกเลิกคิวแล้ว!\n\n"+
				"👨‍⚕️ แพทย์: %s\n"+
				"🦷 บริการ %s\n"+
				"📅 วันที่: %s\n"+
				"🕓 เวลา: %s\n\n"+
				"ขอบคุณที่ใช้บริการ ToothToday 💙",
				doctorName, serviceName, date, timeRange)); err != nil {
			fmt.Println("PushMessage failed:", err)
		}

	}()
	c.JSON(http.StatusOK, gin.H{"message": "Appointment deleted successfully"})
}
func generateMonthAvailability(year int, monthInt int) models.MonthAvailability {
	now := time.Now().In(db.Loc)
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, db.Loc)

	month := time.Month(monthInt)
	monthStr := strconv.Itoa(monthInt)
	// หา firstDay + lastDay ของเดือน
	firstDay := time.Date(year, month, 1, 0, 0, 0, 0, db.Loc)
	lastDay := firstDay.AddDate(0, 1, -1)

	var days []models.DayAvailability

	for d := firstDay; !d.After(lastDay); d = d.AddDate(0, 0, 1) {
		day := d.In(db.Loc)
		dateStr := day.Format("2006-01-02")
		slots := generateSlotsForAllDoctor(dateStr, 60)

		dayStatus := models.Available
		// วันก่อนหน้าวันนี้ -> ปิด
		if day.Before(today) {
			dayStatus = models.Closed
			days = append(days, models.DayAvailability{
				Date:   dateStr,
				Slots:  nil,
				Status: string(models.Closed),
			})
			continue
		}
		// ถ้าเป็นวันปัจจุบัน
		if day.Equal(today) {
			// var futureSlot []models.Slot
			for i, s := range slots {
				slotTime, err := time.Parse("15:04", s.Time)
				if err != nil {
					fmt.Println("parse slot time error:", err)
					continue
				}
				slotDateTime := time.Date(today.Year(), today.Month(), today.Day(),
					slotTime.Hour(), slotTime.Minute(), 0, 0, db.Loc)
				// เวลาผ่านไปแล้ว → mark ว่า passed
				if slotDateTime.Before(now) {
					slots[i].Status = models.Passed
				}
				//กรณีจองระหว่าวันไม่ได้
				// if slotDateTime.After(now) {
				// 	futureSlot = append(futureSlot, s)
				// }
			}
			// slots = futureSlot
		}
		dayStatus = models.Available
		// ไม่มี schedule เลย -> ปิด
		if len(slots) == 0 {
			dayStatus = models.Closed
		} else {
			total := len(slots)
			bookedCount := 0
			for _, s := range slots {
				// fmt.Printf("slot status=%v\n", s.Status)
				if s.Status == models.Booked {
					bookedCount++
				}
			}
			// fmt.Printf("DEBUG %s -> bookedCount=%d total=%d dayStatus=%s\n", dateStr, bookedCount, total, dayStatus)
			switch {
			case bookedCount == total:
				dayStatus = models.FullyBooked
			case float64(bookedCount)/float64(total) >= 0.7:
				dayStatus = models.NearlyFull
			default:
				dayStatus = models.Available
			}
		}
		//debugดูค่าวันนี้
		// fmt.Println("day", day, "today", today)
		// if day.Equal(today) {
		// 	fmt.Printf("Day %s -> Status: %s, Slots: %d\n", dateStr, dayStatus, len(slots))
		// 	for _, s := range slots {
		// 		fmt.Printf("  Slot %s -> Status: %s\n", s.Time, s.Status)
		// 		for _, d := range s.Doctors {
		// 			fmt.Printf("    Doctor %s -> Status: %s\n", d.Name, d.Status)
		// 		}
		// 	}
		// }
		days = append(days, models.DayAvailability{
			Date:   dateStr,
			Status: string(dayStatus),
			Slots:  slots,
		})
	}

	return models.MonthAvailability{
		Month: monthStr,
		Days:  days,
	}
}

func generateSlotsForAllDoctor(dateStr string, duration_minutes int) []models.Slot {
	var slots []models.Slot
	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		return slots
	}
	dayOfWeek := int(date.Weekday())
	rows, err := db.Pool.Query(context.Background(), `
	select ds.doctor_id, ds.start_time, ds.end_time, ds.slot_interval , d.name, d.specialization
	from doctor_schedules ds
	join doctors d on ds.doctor_id = d.id
	where day_of_week = $1
	`, dayOfWeek)
	if err != nil {
		return slots
	}
	defer rows.Close()
	type schedule struct {
		DoctorID       int
		StartTime      time.Time
		EndTime        time.Time
		SlotInterval   int
		DoctorName     string
		Specialization string
	}
	// Temp map สำหรับรวม slot ตามเวลา
	slotMap := make(map[string]*models.Slot)

	for rows.Next() {
		var s schedule
		if err := rows.Scan(&s.DoctorID, &s.StartTime, &s.EndTime, &s.SlotInterval, &s.DoctorName, &s.Specialization); err != nil {
			continue
		}

		bookedMap, _ := getBookedSlotsMap(context.Background(), s.DoctorID, dateStr)
		now := time.Now().In(db.Loc)
		today := now.Truncate(24 * time.Hour)
		// fmt.Println("now", now)
		start := time.Date(date.Year(), date.Month(), date.Day(), s.StartTime.Hour(), s.StartTime.Minute(), 0, 0, db.Loc)
		end := time.Date(date.Year(), date.Month(), date.Day(), s.EndTime.Hour(), s.EndTime.Minute(), 0, 0, db.Loc)
		interval := s.SlotInterval
		if interval <= 0 {
			interval = 60
		}

		// สร้าง slot ตาม schedule
		for t := start; t.Before(end); t = t.Add(time.Duration(interval) * time.Minute) {
			timeStr := t.Format("15:04")
			status := models.Available
			if bookedMap[timeStr] {
				status = models.Booked
			}
			// slotEnd := t.Add(time.Duration(duration_minutes) * time.Minute)
			slotEnd := t
			// fmt.Println("slotEnd", slotEnd)
			if date.Equal(today) && (slotEnd.Before(now) || slotEnd.Equal(now)) {
				status = models.Passed
			}
			// fmt.Println("Slot", timeStr, "slotEnd", slotEnd, "now", now, "status", status)

			doctor := models.Doctor{
				ID:             s.DoctorID,
				Name:           s.DoctorName,
				Specialization: s.Specialization,
				Status:         status,
			}

			// หา slot ใน map
			if _, ok := slotMap[timeStr]; !ok {
				slotMap[timeStr] = &models.Slot{
					Time:     timeStr,
					Duration: duration_minutes,
					Status:   models.Available,
					Doctors:  []models.Doctor{},
				}
			}
			slotMap[timeStr].Doctors = append(slotMap[timeStr].Doctors, doctor)
			// fmt.Println(timeStr, "Doctor:", doctor.Name, "Status:", doctor.Status)

			// fmt.Println("slotMap[timeStr].Doctors", slotMap[timeStr].Doctors)
			// if date.Equal(today) && (slotEnd.Before(now) || slotEnd.Equal(now)) {
			// 	status = models.Passed
			// }
		}

	}

	// แปลง slotMap -> slice
	for _, slot := range slotMap {
		slots = append(slots, *slot)
	}

	//debug
	// for _, s := range slots {
	// 	fmt.Println("Slot", s.Time, "Status", s.Status)
	// 	for _, d := range s.Doctors {
	// 		fmt.Println(" - Doctor", d.Name, "Status", d.Status)
	// 	}
	// }
	// 3️⃣ ตรวจสอบ duration + end time (ต่อหมอ)
	slotsNeeded := (duration_minutes + 59) / 60
	for i := 0; i < len(slots); i++ {
		allAvailable := false
		for _, d := range slots[i].Doctors {
			if d.Status == models.Available {
				allAvailable = true
				break
			}
		}
		if !allAvailable {
			anyPassed := false
			for _, d := range slots[i].Doctors {
				if d.Status == models.Passed {
					anyPassed = true
					break
				}
			}
			if anyPassed {
				slots[i].Status = models.Passed
			}
			// else {
			// 	slots[i].Status = models.Booked
			// }
		}
		// check availability ของ slot ถัดๆ ไป
		canBook := true
		for j := 0; j < slotsNeeded; j++ {
			if i+j >= len(slots) {
				canBook = false
				break
			}
			// ถ้ามีหมอว่างใน slot i+j อย่างน้อยหนึ่งคน -> ถือว่ายังจองได้
			doctorAvailable := false
			for _, d := range slots[i+j].Doctors {
				if d.Status == models.Available {
					doctorAvailable = true
					break
				}
			}
			if !doctorAvailable {
				// || slots[i+j].Status == models.Passed {
				canBook = false
				break
			}
		}
		if !canBook {
			// fmt.Println("Slot", slots[i].Time, "set to BOOKED")
			// slots[i].Status = models.Booked
			if slots[i].Status != models.Passed {
				slots[i].Status = models.Booked
			}

		}
	}

	// 4️⃣ Sort ตามเวลา
	sort.Slice(slots, func(i, j int) bool {
		return slots[i].Time < slots[j].Time
	})

	return slots
}

// GET /api/appointment/availability/day?date=YYYY-MM-DD
func GetDayAvailability(c *gin.Context) {
	dateStr := c.Query("date")
	if dateStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "date is required"})
		return
	}

	slots, err := generateDaySlots(dateStr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, slots)
}
func generateDaySlots(dateStr string) ([]models.Slot, error) {
	var result []models.Slot
	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		return result, err
	}
	startHour := 8
	endHour := 20
	ctx := context.Background()
	now := time.Now().In(db.Loc)
	today := now.Truncate(24 * time.Hour)

	weekday := int(date.Weekday())
	rows, err := db.Pool.Query(ctx, `
	select distinct d.id, d.name, d.specialization
	from doctors d
	join doctor_schedules ds on ds.doctor_id = d.id
	where ds.day_of_week = $1
	`, weekday)
	if err != nil {
		return result, err
	}
	defer rows.Close()
	doctors := map[int]models.Doctor{}
	for rows.Next() {
		var id int
		var name, specialization string
		if err := rows.Scan(&id, &name, &specialization); err != nil {
			continue
		}
		doctors[id] = models.Doctor{ID: id, Name: name, Specialization: specialization}
	}

	//  ดึง appointments ของวันนั้น
	apptRows, err := db.Pool.Query(ctx, `
	select id, user_id, doctor_id, service_id, appointment_time, status, note, image_url, duration_minutes
	from appointments
	where date(appointment_time AT TIME ZONE 'Asia/Bangkok') = $1 and status in ('pending','in_progress','confirmed','booking')
	order by appointment_time asc
	`, dateStr)

	//ไม่ต้องทำก็ได้ ถ้าอยากให้ดึง passed มาโชว์ให้ ให้ดึง no_show, complete ด้วย
	if err != nil {
		return result, err
	}
	defer apptRows.Close()

	slotAppts := make(map[string][]models.DoctorAppointment)
	for apptRows.Next() {
		var a models.Appointment
		if err := apptRows.Scan(&a.ID, &a.UserID, &a.DoctorID, &a.ServiceID, &a.AppointmentTime, &a.Status, &a.Note, &a.ImageURL, &a.DurationMinutes); err != nil {
			continue
		}
		start := a.AppointmentTime.In(db.Loc)
		end := start.Add(time.Duration(a.DurationMinutes) * time.Minute)
		timeStr := fmt.Sprintf("%02d:%02d-%02d:%02d", start.Hour(), start.Minute(), end.Hour(), end.Minute())
		slotsToBlock := (a.DurationMinutes + 59) / 60
		for i := 0; i < slotsToBlock; i++ {
			slotTime := a.AppointmentTime.In(db.Loc).Add(time.Duration(i) * time.Hour)
			if slotTime.Year() != date.Year() || slotTime.Month() != date.Month() || slotTime.Day() != date.Day() {
				continue
			}
			key := slotTime.Format("15:04")
			slotAppts[key] = append(slotAppts[key], models.DoctorAppointment{
				ID:              a.ID,
				DoctorID:        a.DoctorID,
				ServiceID:       a.ServiceID,
				Start:           timeStr,
				DurationMinutes: a.DurationMinutes,
				Status:          a.Status,
			})
		}

	}
	for h := startHour; h <= endHour; h++ {
		t := time.Date(date.Year(), date.Month(), date.Day(), h, 0, 0, 0, db.Loc)
		tStr := t.Format("15:04")
		slot := models.Slot{
			Time:     tStr,
			Duration: 60,
			Doctors:  []models.Doctor{},
			Status:   models.Available,
		}
		// fmt.Println(" today", today, "t", t, "now", now)

		// mark Passed ถ้าเวลาเกิน
		if date.Before(today) {
			slot.Status = models.Passed
		} else if date.Equal(today) && t.Before(now) {
			slot.Status = models.Passed
		}
		if appts, ok := slotAppts[tStr]; ok {
			// ถ้าเวลาเกินแล้ว ก็ยังคง Passed
			if slot.Status != models.Passed {
				slot.Status = models.Booked
			}
			// slot.Status = models.Booked
			for _, ap := range appts {
				if d, ok := doctors[ap.DoctorID]; ok {
					// map service + duration
					dCopy := d
					dCopy.Service = getServiceName(ap.ServiceID) // ฟังก์ชันดึงชื่อ service
					dCopy.Duration = ap.DurationMinutes
					dCopy.Status = models.SlotStatus(ap.Status)
					dCopy.Start = ap.Start
					slot.Doctors = append(slot.Doctors, dCopy)
				}
			}
		}
		result = append(result, slot)
	}
	sort.Slice(result, func(i, j int) bool { return result[i].Time < result[j].Time })
	return result, nil
}

// func generateSlotsForDoctor(doctorID int, dateStr string, duration_minutes int) []models.Slot {
// 	var slots []models.Slot
// 	date, err := time.Parse("2006-01-02", dateStr)

// 	if err != nil {
// 		return slots
// 	}
// 	dayOfWeek := int(date.Weekday())

// 	rows, err := db.Pool.Query(context.Background(), `
// 	select ds.start_time, ds.end_time,ds.slot_interval,d.name,d.specialization
// 	from doctor_schedules ds
// 	join doctors d on ds.doctor_id = d.id
// 	where ds.doctor_id = $1 and ds.day_of_week = $2
// 	`, doctorID, dayOfWeek)
// 	if err != nil {
// 		return slots
// 	}
// 	defer rows.Close()

// 	type Schedule struct {
// 		StartTime      time.Time
// 		EndTime        time.Time
// 		SlotInterval   int
// 		DoctorName     string
// 		Specialization string
// 	}
// 	var schedules []Schedule
// 	for rows.Next() {
// 		var s Schedule
// 		if err := rows.Scan(&s.StartTime, &s.EndTime, &s.SlotInterval, &s.DoctorName, &s.Specialization); err != nil {
// 			continue
// 		}
// 		schedules = append(schedules, s)

// 	}

// 	bookedMap, _ := getBookedSlotsMap(context.Background(), doctorID, dateStr)
// 	now := time.Now().In(db.Loc)
// 	today := now.Truncate(24 * time.Hour)
// 	//สร้าง slot ตาม schedule + mark booked/available
// 	for _, s := range schedules {
// 		start := time.Date(date.Year(), date.Month(), date.Day(), s.StartTime.Hour(), s.StartTime.Minute(), 0, 0, db.Loc)
// 		end := time.Date(date.Year(), date.Month(), date.Day(), s.EndTime.Hour(), s.EndTime.Minute(), 0, 0, db.Loc)
// 		interval := s.SlotInterval
// 		if interval <= 0 {
// 			interval = 60
// 		}

// 		for t := start; t.Before(end); t = t.Add(time.Duration(interval) * time.Minute) {
// 			timeStr := t.Format("15:04")
// 			status := models.Available
// 			if bookedMap[timeStr] {
// 				status = models.Booked
// 			}
// 			if date.Equal(today) && !t.After(now) {
// 				status = models.Passed
// 			}
// 			slot := models.Slot{
// 				Time:     timeStr,
// 				Duration: duration_minutes,
// 				Status:   status,
// 				Doctors: []models.Doctor{
// 					{ID: doctorID,
// 						Name:           s.DoctorName,
// 						Specialization: s.Specialization,
// 						Status:         status},
// 				},
// 			}
// 			slots = append(slots, slot)
// 		}
// 	}

//		//ตรวจสอบ duration service -> mark slot ไม่ว่างถ้า slot หน้าๆ ไม่ว่างหรือเกินเวลาหมอ
//		slotsNeeded := (duration_minutes + 59) / 60
//		for i := 0; i < len(slots); i++ {
//			if slots[i].Status == models.Booked || slots[i].Status == models.Passed {
//				continue
//			}
//			canBook := true
//			for j := 0; j < slotsNeeded; j++ {
//				if i+j >= len(slots) {
//					canBook = false // slot ถัดไปเกินเวลาหมอ
//					break
//				}
//				if slots[i+j].Status == models.Booked {
//					canBook = false // slot ถัดไปไม่ว่าง
//					break
//				}
//			}
//			if !canBook {
//				slots[i].Status = models.Booked
//				slots[i].Doctors[0].Status = models.Booked
//			}
//		}
//		return slots
//	}
