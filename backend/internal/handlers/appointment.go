package handlers

import (
	"context"
	"fmt"
	"log"
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
		slots = generateSlotsByDate(date, service.Duration_minutes)
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
			fmt.Printf("DEBUG: Blocking slot %s (duration %d min)\n", slotTime, durationMinutes)
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

	// Soft delete the appointment (set is_delete = true)
	// result, err := db.Pool.Exec(c, `
	//     UPDATE appointments
	//     SET is_delete = true, updated_at = NOW()
	//     WHERE id = $1 AND user_id = $2
	// `, id, userID)

	// Hard delete (old)
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
	// fmt.Printf("=== GENERATING SLOTS FOR DATE: %s ===\n", dateStr)
	var slots []models.Slot
	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		// fmt.Printf("ERROR: Invalid date format: %s\n", dateStr)
		return slots
	}
	dayOfWeek := int(date.Weekday())
	// fmt.Printf("Day of week: %d (%s)\n", dayOfWeek, date.Weekday().String())
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
		// fmt.Println("bookedMap", bookedMap)
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
				// fmt.Println("Mark slot", timeStr, "slotEnd", slotEnd, "now", now, "status", status)

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
	// fmt.Println("=== INITIALIZING SLOTS ===")
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
				// fmt.Printf("DEBUG: Slot %s Can book cuz: i+j >= len(slots)", slots[i].Time)
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
				// fmt.Printf("DEBUG: Slot %s Can book cuz: !doctorAvailable", slots[i].Time)

				break
			}
		}
		if !canBook {
			// fmt.Printf("DEBUG: Slot %s marked as BOOKED - insufficient consecutive slots (need %d hours)\n", slots[i].Time, slotsNeeded)
			// fmt.Printf("DEBUG: Slot %s doctors statuses: ", slots[i].Time)
			// for _, d := range slots[i].Doctors {
			// 	fmt.Printf("%s(%s) ", d.Name, d.Status)
			// }
			// fmt.Println()
			// slots[i].Status = models.Booked
			if slots[i].Status != models.Passed {
				slots[i].Status = models.Unavailable // เปลี่ยนเป็น Unavailable
				// fmt.Printf("DEBUG: Slot %s Mark to Unavailable: ", slots[i].Time)
			}

		}
	}

	// 4️⃣ Sort ตามเวลา
	sort.Slice(slots, func(i, j int) bool {
		return slots[i].Time < slots[j].Time
	})

	return slots
}

// generateSlotsByDate สร้าง slots สำหรับวันที่ต้องการ
// Logic แยกเป็นส่วนๆ เพื่อความชัดเจน:
// 1. ดึงข้อมูล doctor schedules สำหรับวันนั้น (dayOfWeek)
// 2. สร้าง slots ตาม schedule ที่ได้
// 3. ดึง booked slots สำหรับวันนั้นและหมอแต่ละคน
// 4.  mark slots ตามการจอง
// 5. ตรวจสอบว่ามีเวลาพอทำบริการหรือไม่
func generateSlotsByDate(dateStr string, durationMinutes int) []models.Slot {
	fmt.Printf("=== GENERATING SLOTS FOR DATE: %s (Service: %d min) ===\n", dateStr, durationMinutes)

	// 1. แปลง date string และหา dayOfWeek
	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		fmt.Printf("ERROR: Invalid date format: %s\n", dateStr)
		return []models.Slot{}
	}
	dayOfWeek := int(date.Weekday())
	fmt.Printf("Processing %s (Day %d: %s)\n", dateStr, dayOfWeek, date.Weekday().String())

	// 2. ดึง doctor schedules สำหรับวันนั้น
	rows, err := db.Pool.Query(context.Background(), `
		SELECT ds.doctor_id, ds.start_time, ds.end_time, ds.slot_interval, d.name, d.specialization
		FROM doctor_schedules ds
		JOIN doctors d ON ds.doctor_id = d.id
		WHERE ds.day_of_week = $1
	`, dayOfWeek)
	if err != nil {
		fmt.Printf("ERROR: Failed to query doctor schedules: %v\n", err)
		return []models.Slot{}
	}
	defer rows.Close()

	// 3. เก็บข้อมูล schedules ไว้
	type DoctorSchedule struct {
		DoctorID       int
		StartTime      time.Time
		EndTime        time.Time
		SlotInterval   int
		DoctorName     string
		Specialization string
	}

	var schedules []DoctorSchedule
	for rows.Next() {
		var s DoctorSchedule
		if err := rows.Scan(&s.DoctorID, &s.StartTime, &s.EndTime, &s.SlotInterval, &s.DoctorName, &s.Specialization); err != nil {
			fmt.Printf("ERROR: Failed to scan schedule: %v\n", err)
			continue
		}
		if s.SlotInterval <= 0 {
			s.SlotInterval = 60 // default 60 minutes
		}
		schedules = append(schedules, s)
		fmt.Printf("Doctor %d (%s) works %s-%s every %d min\n",
			s.DoctorID, s.DoctorName,
			s.StartTime.Format("15:04"), s.EndTime.Format("15:04"),
			s.SlotInterval)
	}

	// 4. สร้าง slot map สำหรับรวมข้อมูลตามเวลา
	slotMap := make(map[string]*models.Slot)

	// 5. สำหรับแต่ละ doctor schedule
	for _, schedule := range schedules {
		fmt.Printf("\n--- Processing Doctor %d (%s) ---\n", schedule.DoctorID, schedule.DoctorName)

		// 5.1 ดึง booked slots สำหรับหมอคนนี้ในวันนี้
		bookedMap, err := getBookedSlotsMap(context.Background(), schedule.DoctorID, dateStr)
		if err != nil {
			fmt.Printf("ERROR: Failed to get booked slots for doctor %d: %v\n", schedule.DoctorID, err)
			bookedMap = make(map[string]bool) // ใช้ empty map ถ้า error
		}
		fmt.Printf("Booked slots for doctor %d: %v\n", schedule.DoctorID, getBookedSlotTimes(bookedMap))

		// 5.2 สร้าง slots ตาม working hours
		startTime := time.Date(date.Year(), date.Month(), date.Day(),
			schedule.StartTime.Hour(), schedule.StartTime.Minute(), 0, 0, db.Loc)
		endTime := time.Date(date.Year(), date.Month(), date.Day(),
			schedule.EndTime.Hour(), schedule.EndTime.Minute(), 0, 0, db.Loc)

		fmt.Printf("Generating slots from %s to %s\n",
			startTime.Format("15:04"), endTime.Format("15:04"))

		// สร้าง slot ทุกชั่วโมงตาม interval
		for slotTime := startTime; slotTime.Before(endTime); slotTime = slotTime.Add(time.Duration(schedule.SlotInterval) * time.Minute) {
			timeStr := slotTime.Format("15:04")

			// 5.3 กำหนด status ของ doctor ก่อน
			doctorStatus := models.Available
			if bookedMap[timeStr] {
				doctorStatus = models.Booked
				fmt.Printf("  Doctor %s: BOOKED (found in bookedMap)\n", timeStr)
			}

			// 5.4 ตรวจสอบว่าเวลาผ่านไปแล้วหรือไม่ (สำหรับวันนี้)
			now := time.Now().In(db.Loc)
			today := now.Truncate(24 * time.Hour)
			if date.Equal(today) && slotTime.Before(now) {
				doctorStatus = models.Passed
				fmt.Printf("  Doctor %s: PASSED (time already passed)\n", timeStr)
			} else if doctorStatus == models.Available {
				fmt.Printf("  Doctor %s: AVAILABLE\n", timeStr)
			}

			// 5.5 สร้าง doctor object
			doctor := models.Doctor{
				ID:             schedule.DoctorID,
				Name:           schedule.DoctorName,
				Specialization: schedule.Specialization,
				Status:         doctorStatus,
			}

			// 5.6 เพิ่ม slot ลง map (รวม doctors ที่เวลาเดียวกัน)
			if _, exists := slotMap[timeStr]; !exists {
				slotMap[timeStr] = &models.Slot{
					Time:     timeStr,
					Duration: durationMinutes,
					Status:   models.Available, // จะถูก update ทีหลัง
					Doctors:  []models.Doctor{},
				}
			}
			slotMap[timeStr].Doctors = append(slotMap[timeStr].Doctors, doctor)
		}
	}

	// 6. แปลง map เป็น slice และ sort
	var slots []models.Slot
	for _, slot := range slotMap {
		slots = append(slots, *slot)
	}
	sort.Slice(slots, func(i, j int) bool {
		return slots[i].Time < slots[j].Time
	})

	// 7. ตรวจสอบ consecutive slots สำหรับบริการที่ต้องการ durationMinutes
	fmt.Printf("\n=== CHECKING CONSECUTIVE SLOTS (need %d hours) ===\n", (durationMinutes+59)/60)
	slotsNeeded := (durationMinutes + 59) / 60

	//mark status
	for i := 0; i < len(slots); i++ {
		slot := &slots[i]

		// 7.1 ไม่ข้าม slot ที่มี doctor booked - ต้องตรวจสอบว่า doctor คนอื่นว่างติดต่อกันหรือไม่

		// 7.2 ตรวจสอบว่ามี doctor ว่างใน slot นี้หรือไม่
		hasAvailableDoctor := false
		for _, doctor := range slot.Doctors {
			if doctor.Status == models.Available {
				hasAvailableDoctor = true
				break
			}
		}

		if !hasAvailableDoctor {
			continue // ไม่มีหมอว่างเลย ข้าม
		}

		// 7.3 ตรวจสอบว่ามี doctor คนใดคนหนึ่งว่างติดต่อกันพอทำบริการหรือไม่
		canBookService := false

		// ตรวจสอบแต่ละ doctor ใน slot ปัจจุบัน
		for _, currentDoctor := range slot.Doctors {
			if currentDoctor.Status != models.Available {
				continue // ข้าม doctor ที่ไม่ว่าง
			}

			// ตรวจสอบว่า doctor คนนี้ว่างติดต่อกันในทุก slot ที่ต้องการ
			doctorAvailableInAllSlots := true
			for j := 0; j < slotsNeeded; j++ {
				if i+j >= len(slots) {
					fmt.Printf("Doctor %d: CANNOT BOOK - not enough slots\n", currentDoctor.ID)
					doctorAvailableInAllSlots = false
					break
				}

				// หา doctor คนเดียวกันใน slot ถัดไป
				checkSlot := &slots[i+j]
				foundDoctorInSlot := false
				for _, doctorInSlot := range checkSlot.Doctors {
					if doctorInSlot.ID == currentDoctor.ID {
						if doctorInSlot.Status == models.Available {
							foundDoctorInSlot = true
						}
						break // หา doctor คนนี้แล้ว ไม่ว่าจะ available หรือไม่
					}
				}

				// ถ้าไม่เจอ doctor คนนี้ใน slot เลย แสดงว่าไม่ทำงานในเวลานั้น
				if !foundDoctorInSlot {
					fmt.Printf("Doctor %d: CANNOT BOOK - not found in slot %s (doctor not working)\n", currentDoctor.ID, checkSlot.Time)
					fmt.Printf("  Available doctors in slot %s: ", checkSlot.Time)
					for _, doc := range checkSlot.Doctors {
						fmt.Printf("ID:%d Status:%s ", doc.ID, doc.Status)
					}
					fmt.Println()
					doctorAvailableInAllSlots = false
					break
				}
			}

			if doctorAvailableInAllSlots {
				fmt.Printf("Doctor %d: CAN BOOK - available in all required slots\n", currentDoctor.ID)
				canBookService = true
				break // พบ doctor ที่ว่างติดต่อกันแล้ว
			}
		}

		// 7.4 ถ้าไม่สามารถทำบริการได้ ให้ mark เป็น unavailable
		if !canBookService {
			slot.Status = models.Unavailable
			// อัปเดต status ของ doctor ที่ไม่สามารถจองได้
			// for i := range slot.Doctors {
			// 	if slot.Doctors[i].Status == models.Available {
			// 		slot.Doctors[i].Status = models.Unavailable
			// 	}
			// }
			fmt.Printf("Slot %s: MARKED UNAVAILABLE\n", slot.Time)
		} else {
			fmt.Printf("Slot %s: REMAINS AVAILABLE\n", slot.Time)
		}
	}

	// 8. Update slot status based on doctors' status
	for i := range slots {
		slot := &slots[i]

		// ถ้า slot ถูก mark เป็น unavailable จาก consecutive slots check ให้คงไว้
		if slot.Status == models.Unavailable {
			continue
		}

		// ตรวจสอบสถานะของ doctors
		hasAvailableDoctor := false
		hasPassedDoctor := false
		allDoctorsBooked := true

		for _, doctor := range slot.Doctors {
			if doctor.Status == models.Available {
				hasAvailableDoctor = true
				allDoctorsBooked = false
			}
			if doctor.Status == models.Passed {
				hasPassedDoctor = true
				allDoctorsBooked = false
			}
			if doctor.Status != models.Booked {
				allDoctorsBooked = false
			}
		}

		// Logic ใหม่:
		// - ถ้ามี doctor ว่างอย่างน้อย 1 คน → available
		// - ถ้าทุก doctor booked → booked
		// - ถ้าทุก doctor passed → passed
		if hasAvailableDoctor {
			slot.Status = models.Available
		} else if allDoctorsBooked {
			slot.Status = models.Booked
		} else if hasPassedDoctor {
			slot.Status = models.Passed
		}
	}

	// 9. Final result
	fmt.Printf("\n=== FINAL RESULT (%d slots) ===\n", len(slots))
	for _, slot := range slots {
		fmt.Printf("  %s: %s (%d doctors)\n", slot.Time, slot.Status, len(slot.Doctors))
	}

	return slots
}

// helper function แสดง booked slot times
func getBookedSlotTimes(bookedMap map[string]bool) []string {
	var times []string
	for timeStr := range bookedMap {
		times = append(times, timeStr)
	}
	sort.Strings(times)
	return times
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
	where date(appointment_time AT TIME ZONE 'Asia/Bangkok') = $1 and status in ('pending','in_progress','confirm','booking')
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

// GetAppointmentsForAdmin ดึงข้อมูลคิวสำหรับ admin พร้อมข้อมูลเพิ่มเติม
func GetAppointmentsForAdmin(c *gin.Context) {
	dateStr := c.Query("date")
	if dateStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Date parameter is required"})
		return
	}

	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format"})
		return
	}

	// Query ดึงข้อมูลคิวพร้อมข้อมูลผู้ใช้ แพทย์ และบริการ
	query := `
		SELECT 
			a.id,
			a.user_id,
			u.name as user_name,
			a.doctor_id,
			d.name as doctor_name,
			a.service_id,
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

	rows, err := db.Pool.Query(c, query, date)
	if err != nil {
		log.Printf("Error fetching appointments: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch appointments"})
		return
	}
	defer rows.Close()

	var appointments []models.AppointmentForAdmin
	for rows.Next() {
		var (
			id, userID, doctorID, serviceID                   int
			userName, doctorName, serviceName, note, imageURL string
			status                                            string
			appointmentTime                                   time.Time
			durationMinutes                                   int
		)

		err := rows.Scan(
			&id, &userID, &userName, &doctorID, &doctorName,
			&serviceID, &serviceName, &durationMinutes,
			&appointmentTime, &status, &note, &imageURL,
		)
		if err != nil {
			log.Printf("Error scanning appointment row: %v", err)
			continue
		}

		// Calculate end time
		endTime := appointmentTime.Add(time.Duration(durationMinutes) * time.Minute)
		timeRange := fmt.Sprintf("%s - %s",
			appointmentTime.In(db.Loc).Format("15:04"),
			endTime.In(db.Loc).Format("15:04"))

		appointment := models.AppointmentForAdmin{
			ID:              id,
			UserName:        userName,
			DoctorName:      doctorName,
			ServiceName:     serviceName,
			AppointmentTime: appointmentTime,
			TimeRange:       timeRange,
			DurationMinutes: durationMinutes,
			Status:          status,
			Note:            &note,
			ImageURL:        &imageURL,
		}

		appointments = append(appointments, appointment)
	}

	c.JSON(http.StatusOK, appointments)
}

// UpdateAppointmentStatus อัปเดตสถานะคิว
func UpdateAppointmentStatus(c *gin.Context) {
	appointmentIDStr := c.Param("id")
	appointmentID, err := strconv.Atoi(appointmentIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid appointment ID"})
		return
	}

	var req struct {
		Status string `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// ตรวจสอบค่าสถานะที่อนุญาต
	validStatuses := map[string]bool{
		"pending":     true,
		"confirm":     true,
		"in_progress": true,
		"complete":    true,
		// "cancelled":   true,
		"no_show": true,
	}

	if !validStatuses[req.Status] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid status"})
		return
	}

	// อัปเดตสถานะ
	query := "UPDATE appointments SET status = $1, updated_at = NOW() WHERE id = $2"
	result, err := db.Pool.Exec(c, query, req.Status, appointmentID)
	if err != nil {
		log.Printf("Error updating appointment status: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update status"})
		return
	}

	rowsAffected := result.RowsAffected()

	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Appointment not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Status updated successfully"})
}

// DeleteAppointmentForAdmin ลบคิวสำหรับ admin
func DeleteAppointmentForAdmin(c *gin.Context) {
	appointmentIDStr := c.Param("id")
	appointmentID, err := strconv.Atoi(appointmentIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid appointment ID"})
		return
	}

	// ตรวจสอบว่ามีคิวอยู่จริงหรือไม่
	var exists bool
	checkQuery := "SELECT EXISTS(SELECT 1 FROM appointments WHERE id = $1)"
	err = db.Pool.QueryRow(c, checkQuery, appointmentID).Scan(&exists)
	if err != nil {
		log.Printf("Error checking appointment existence: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check appointment"})
		return
	}

	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Appointment not found"})
		return
	}

	// Soft delete the appointment (set is_delete = true)
	// deleteQuery := "UPDATE appointments SET is_delete = true, updated_at = NOW() WHERE id = $1"
	// Hard delete
	deleteQuery := "DELETE FROM appointments WHERE id = $1"

	result, err := db.Pool.Exec(c, deleteQuery, appointmentID)
	if err != nil {
		log.Printf("Error deleting appointment: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete appointment"})
		return
	}

	rowsAffected := result.RowsAffected()
	if err != nil {
		log.Printf("Error getting rows affected: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete appointment"})
		return
	}

	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Appointment not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Appointment deleted successfully"})
}

// GET /api/appointment/availability/day?date=YYYY-MM-DD
func GetAppointmentForAdmin(c *gin.Context) {
	dateStr := c.Query("date")

	//row นึง ชื่อคนไข้, ชือหมอ, ชื่อ service, เวลาจอง - เวลาสิ้นสุด (+จาก duration_minute) ,image_url,ละก็ status (real จาก appointments)

	if dateStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "date is required"})
		return
	}

	// Query to get appointments with all required information
	query := `
		SELECT 
			a.id,
			u.name as user_name,
			d.name as doctor_name,
			s.name as service_name,
			a.appointment_time,
			a.status,
			a.note,
			a.image_url,
			a.duration_minutes
		FROM appointments a
		JOIN doctors d ON d.id = a.doctor_id
		JOIN services s ON s.id = a.service_id
		JOIN users u ON u.id = a.user_id
		WHERE DATE(a.appointment_time AT TIME ZONE 'Asia/Bangkok') = $1
		ORDER BY a.appointment_time ASC
	`

	rows, err := db.Pool.Query(c, query, dateStr)
	if err != nil {
		log.Printf("Error fetching appointments: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch appointments"})
		return
	}
	defer rows.Close()

	var appointments []models.AppointmentForAdmin
	for rows.Next() {
		var (
			id, durationMinutes               int
			userName, doctorName, serviceName string
			status, note, imageURL            string
			appointmentTime                   time.Time
		)

		err := rows.Scan(
			&id, &userName, &doctorName, &serviceName,
			&appointmentTime, &status, &note, &imageURL, &durationMinutes,
		)
		if err != nil {
			log.Printf("Error scanning appointment row: %v", err)
			continue
		}

		// Calculate end time
		endTime := appointmentTime.Add(time.Duration(durationMinutes) * time.Minute)
		timeRange := fmt.Sprintf("%s - %s",
			appointmentTime.Format("15:04"),
			endTime.Format("15:04"))

		appointment := models.AppointmentForAdmin{
			ID:              id,
			UserName:        userName,
			DoctorName:      doctorName,
			ServiceName:     serviceName,
			AppointmentTime: appointmentTime,
			TimeRange:       timeRange,
			DurationMinutes: durationMinutes,
			Status:          status,
			Note:            &note,
			ImageURL:        &imageURL,
		}

		appointments = append(appointments, appointment)
	}

	c.JSON(http.StatusOK, gin.H{
		"date":         dateStr,
		"appointments": appointments,
	})
}

func EditAppointmentStatus(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid appointment ID"})
		return
	}

	var req struct {
		Status string `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// ตรวจสอบค่าสถานะที่อนุญาต
	validStatuses := map[string]bool{
		"pending":     true,
		"confirm":     true,
		"in_progress": true,
		"complete":    true,
		"cancelled":   true,
		"no_show":     true,
	}

	if !validStatuses[req.Status] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid status"})
		return
	}

	// อัปเดตข้อมูล
	query := `
		UPDATE appointments 
		SET status = COALESCE(NULLIF($1, ''), status),
			updated_at = NOW()
		WHERE id = $2
	`

	result, err := db.Pool.Exec(c, query, req.Status, id)
	if err != nil {
		log.Printf("Error updating appointment status: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update appointment status"})
		return
	}

	rowsAffected := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Appointment not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Appointment status updated successfully"})
}

func DeleteAppointmentByIDForAdmin(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid appointment ID"})
		return
	}
	//SOFT DEL
	// result, err := db.Pool.Exec(c, `
	//     UPDATE appointments
	//     SET is_delete = true, updated_at = NOW()
	//     WHERE id = $1
	// `, id)
	//HARD DEL
	result, err := db.Pool.Exec(c, `
        DELETE FROM appointments 
        WHERE id = $1
    `, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete appointment"})
		return
	}
	rowsAffected := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Appointment not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Appointment deleted successfully"})
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
