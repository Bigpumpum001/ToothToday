package appointment

import (
	"context"
	"fmt"
	"sort"
	"strconv"
	"strings"
	"time"
	"toothtoday/internal/db"
	"toothtoday/internal/models"
	"toothtoday/internal/repository"
)

func GetBookedSlots(
	ctx context.Context,
	doctorID int,
	date string,
) ([]string, error) {

	slotMap, err := GetBookedSlotsMap(ctx, doctorID, date)
	if err != nil {
		return nil, err
	}

	var slots []string
	for s := range slotMap {
		slots = append(slots, s)
	}
	sort.Strings(slots)

	return slots, nil
}

func GetBookedSlotsMap(
	ctx context.Context,
	doctorID int,
	date string,
) (map[string]bool, error) {

	appointments, err := repository.GetAppointmentsByDoctorAndDate(ctx, doctorID, date)
	if err != nil {
		return nil, err
	}

	slotMap := make(map[string]bool)

	for _, appt := range appointments {

		start := appt.AppointmentTime
		durationMinutes := appt.DurationMinutes

		slotsToBlock := (durationMinutes + 59) / 60

		for i := 0; i < slotsToBlock; i++ {
			slotTime := start.
				In(db.Loc).
				Add(time.Duration(i) * time.Hour).
				Format("15:04")
			// fmt.Printf("DEBUG: Blocking slot %s (duration %d min)\n", slotTime, durationMinutes)

			slotMap[slotTime] = true
		}
	}

	return slotMap, nil
}

func GetMonthAvailability(
	ctx context.Context,
	month string,
) (models.MonthAvailability, error) {

	yearMonth := strings.Split(month, "-")
	if len(yearMonth) != 2 {
		return models.MonthAvailability{}, fmt.Errorf("invalid month format")
	}

	year, err := strconv.Atoi(yearMonth[0])
	if err != nil {
		return models.MonthAvailability{}, err
	}

	monthInt, err := strconv.Atoi(yearMonth[1])
	if err != nil {
		return models.MonthAvailability{}, err
	}

	availability := GenerateMonthAvailability(ctx, year, monthInt)

	// handle error
	// if availability.Days == nil {
	// 	return models.MonthAvailability{}, fmt.Errorf("cannot generate availability")
	// }

	return availability, nil
}

////////////////////////////////////
/////////// Internal Helper ////////
////////////////////////////////////

func GenerateDaySlots(dateStr string) ([]models.Slot, error) {
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
	doctors, err := repository.GetDoctorsByWeekday(ctx, weekday)
	if err != nil {
		return result, err
	}

	appointments, err := repository.GetAppointmentsByDate(ctx, dateStr)
	if err != nil {
		return result, err
	}

	slotAppts := make(map[string][]models.DoctorAppointment)
	for _, a := range appointments {
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
					dCopy.Service = repository.GetServiceName(ap.ServiceID) // ฟังก์ชันดึงชื่อ service
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

func GenerateSlotsByDate(c context.Context, dateStr string, durationMinutes int) []models.Slot {
	// fmt.Printf("=== GENERATING SLOTS FOR DATE: %s (Service: %d min) ===\n", dateStr, durationMinutes)
	var slots []models.Slot

	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		return []models.Slot{}
	}
	dayOfWeek := int(date.Weekday())
	// fmt.Printf("Processing %s (Day %d: %s)\n", dateStr, dayOfWeek, date.Weekday().String())
	// 1. ดึงข้อมูล doctor schedules สำหรับวันนั้น (dayOfWeek)
	schedules, err := repository.GetDoctorSchedulesByDay(c, dayOfWeek)
	if err != nil {
		return slots
	}
	// 2. สร้าง slots ตาม schedule ที่ได้
	slotMap := make(map[string]*models.Slot)

	for _, schedule := range schedules {
		if schedule.SlotInterval <= 0 {
			schedule.SlotInterval = 60
		}
		// ดึง booked slots สำหรับหมอคนนี้ในวันนี้
		bookedMap, err := GetBookedSlotsMap(context.Background(), schedule.DoctorID, dateStr)
		if err != nil {
			// fmt.Printf("ERROR: Failed to get booked slots for doctor %d: %v\n", schedule.DoctorID, err)
			bookedMap = make(map[string]bool) // ใช้ empty map ถ้า error
		}
		// fmt.Printf("Booked slots for doctor %d: %v\n", schedule.DoctorID, GetBookedSlotTimes(bookedMap))

		// 5.2 สร้าง slots ตาม working hours
		sStartTime, _ := time.Parse("15:04:05", schedule.StartTime)
		sEndTime, _ := time.Parse("15:04:05", schedule.EndTime)
		startTime := time.Date(date.Year(), date.Month(), date.Day(),
			sStartTime.Hour(), sStartTime.Minute(), 0, 0, db.Loc)
		endTime := time.Date(date.Year(), date.Month(), date.Day(),
			sEndTime.Hour(), sEndTime.Minute(), 0, 0, db.Loc)

		// fmt.Printf("Generating slots from %s to %s\n",
		// 	startTime.Format("15:04"), endTime.Format("15:04"))

		// สร้าง slot ทุกชั่วโมงตาม interval
		for slotTime := startTime; slotTime.Before(endTime); slotTime = slotTime.Add(time.Duration(schedule.SlotInterval) * time.Minute) {
			timeStr := slotTime.Format("15:04")

			// 5.3 กำหนด status ของ doctor ก่อน
			doctorStatus := models.Available
			if bookedMap[timeStr] {
				doctorStatus = models.Booked
				// fmt.Printf("  Doctor %s: BOOKED (found in bookedMap)\n", timeStr)
			}

			// 5.4 ตรวจสอบว่าเวลาผ่านไปแล้วหรือไม่ (สำหรับวันนี้)
			now := time.Now().In(db.Loc)
			today := now.Truncate(24 * time.Hour)
			if date.Equal(today) && slotTime.Before(now) {
				doctorStatus = models.Passed
				// fmt.Printf("  Doctor %s: PASSED (time already passed)\n", timeStr)
			} else if doctorStatus == models.Available {
				// fmt.Printf("  Doctor %s: AVAILABLE\n", timeStr)
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
	for _, slot := range slotMap {
		slots = append(slots, *slot)
	}
	sort.Slice(slots, func(i, j int) bool {
		return slots[i].Time < slots[j].Time
	})

	// 7. ตรวจสอบ consecutive slots สำหรับบริการที่ต้องการ durationMinutes
	// fmt.Printf("\n=== CHECKING CONSECUTIVE SLOTS (need %d hours) ===\n", (durationMinutes+59)/60)
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
					// fmt.Printf("Doctor %d: CANNOT BOOK - not enough slots\n", currentDoctor.ID)
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
					// fmt.Printf("Doctor %d: CANNOT BOOK - not found in slot %s (doctor not working)\n", currentDoctor.ID, checkSlot.Time)
					// fmt.Printf("  Available doctors in slot %s: ", checkSlot.Time)
					// for _, doc := range checkSlot.Doctors {
					// 	fmt.Printf("ID:%d Status:%s ", doc.ID, doc.Status)
					// }
					// fmt.Println()
					doctorAvailableInAllSlots = false
					break
				}
			}

			if doctorAvailableInAllSlots {
				// fmt.Printf("Doctor %d: CAN BOOK - available in all required slots\n", currentDoctor.ID)
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
			// fmt.Printf("Slot %s: MARKED UNAVAILABLE\n", slot.Time)
		} else {
			// fmt.Printf("Slot %s: REMAINS AVAILABLE\n", slot.Time)
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
func GetBookedSlotTimes(bookedMap map[string]bool) []string {
	var times []string
	for timeStr := range bookedMap {
		times = append(times, timeStr)
	}
	sort.Strings(times)
	return times
}

func GenerateSlotsForAllDoctor(c context.Context, dateStr string, duration_minutes int) []models.Slot {
	var slots []models.Slot
	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		return slots
	}
	dayOfWeek := int(date.Weekday())
	schedules, err := repository.GetDoctorSchedulesByDay(c, dayOfWeek)
	if err != nil {
		return slots
	}

	// Temp map สำหรับรวม slot ตามเวลา
	slotMap := make(map[string]*models.Slot)

	now := time.Now().In(db.Loc)
	today := now.Truncate(24 * time.Hour)

	for _, s := range schedules {
		startTime, _ := time.Parse("15:04:05", s.StartTime)
		endTime, _ := time.Parse("15:04:05", s.EndTime)
		bookedMap, _ := GetBookedSlotsMap(c, s.DoctorID, dateStr)

		start := time.Date(date.Year(), date.Month(), date.Day(), startTime.Hour(), startTime.Minute(), 0, 0, db.Loc)
		end := time.Date(date.Year(), date.Month(), date.Day(), endTime.Hour(), endTime.Minute(), 0, 0, db.Loc)
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
			slotEnd := t
			if date.Equal(today) && (slotEnd.Before(now) || slotEnd.Equal(now)) {
				status = models.Passed

			}

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

			// if date.Equal(today) && (slotEnd.Before(now) || slotEnd.Equal(now)) {
			// 	status = models.Passed
			// }
		}

	}

	// แปลง slotMap -> slice
	for _, slot := range slotMap {
		slots = append(slots, *slot)
	}

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
				canBook = false

				break
			}
		}
		if !canBook {

			// slots[i].Status = models.Booked
			if slots[i].Status != models.Passed {
				slots[i].Status = models.Unavailable // เปลี่ยนเป็น Unavailable
			}

		}
	}

	// 4️⃣ Sort ตามเวลา
	sort.Slice(slots, func(i, j int) bool {
		return slots[i].Time < slots[j].Time
	})

	return slots
}

func GenerateMonthAvailability(c context.Context, year int, monthInt int) models.MonthAvailability {
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
		slots := GenerateSlotsForAllDoctor(c, dateStr, 60)

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
