package handlers

import (
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"
	"toothtoday/internal/db"
	"toothtoday/internal/models"

	"github.com/gin-gonic/gin"
)

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
		WHERE DATE(a.appointment_time) = $1 AND a.is_delete = false
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
	deleteQuery := "UPDATE appointments SET is_delete = true, updated_at = NOW() WHERE id = $1"
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
		WHERE DATE(a.appointment_time AT TIME ZONE 'Asia/Bangkok') = $1 AND a.is_delete = false
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

	result, err := db.Pool.Exec(c, `
        UPDATE appointments 
        SET is_delete = true, updated_at = NOW()
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
