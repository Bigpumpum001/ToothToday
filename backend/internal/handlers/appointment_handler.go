package handlers

import (
	"errors"
	"net/http"
	"strconv"
	"time"
	"toothtoday/internal/models"
	"toothtoday/internal/services/appointment"

	"github.com/gin-gonic/gin"
)

// http://localhost:8080/api/appointment?user_id=1
func GetAppointment(c *gin.Context) {
	userID := c.Query("user_id")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id is required"})
		return
	}
	appointments, err := appointment.GetAppointmentsByUser(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "DB error"})
		return
	}

	c.JSON(http.StatusOK, appointments)
}

// GET/api/appointment/slots?serviceId=$X
// GET/api/appointment/slots?serviceId=$X&date=YYYY-MM-DD
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

	date := c.Query("date")

	slots, err := appointment.GetDoctorSlots(
		c.Request.Context(),
		serviceID,
		date,
	)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "service not found"})
		return
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

	slots, err := appointment.GetBookedSlots(
		c.Request.Context(),
		doctorID,
		date,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, slots)
}

// GET /api/appointment/availability?month=2025-08
func GetMonthAvailability(c *gin.Context) {
	month := c.Query("month") // YYYY/MM
	if month == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "month is required"})
		return
	}

	availability, err := appointment.GetMonthAvailability(
		c.Request.Context(),
		month,
	)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, availability)
}

// POST /api/appointment/book
func CreateAppointment(c *gin.Context) {
	ctx := c.Request.Context()
	// var a models.Appointment
	userIDStr := c.PostForm("user_id")
	doctorIDStr := c.PostForm("doctor_id")
	serviceIDStr := c.PostForm("service_id")
	appointmentTimeStr := c.PostForm("appointment_time")
	status := c.PostForm("status")
	note := c.PostForm("note")

	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user_id"})
		return
	}
	doctorID, _ := strconv.Atoi(doctorIDStr)
	serviceID, _ := strconv.Atoi(serviceIDStr)

	appointmentTime, err := time.Parse(time.RFC3339, appointmentTimeStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid appointment_time"})
		return
	}

	if userID == 0 || doctorID == 0 || serviceID == 0 || appointmentTime.IsZero() || status == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing required field"})
		return
	}
	fileHeader, _ := c.FormFile("file")

	result, err := appointment.CreateAppointment(
		ctx, models.CreateAppointmentInput{UserID: userID,
			DoctorID:        doctorID,
			ServiceID:       serviceID,
			AppointmentTime: appointmentTime,
			Status:          status,
			Note:            note,
			FileHeader:      fileHeader},
	)

	if err != nil {
		switch {
		case errors.Is(err, appointment.ErrInvalidInput):
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})

		case errors.Is(err, appointment.ErrAlreadyBooked):
			c.JSON(http.StatusForbidden, gin.H{"error": "คุณได้จองแล้ว ไม่สามารถจองเพิ่มได้"})

		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"doctor":     gin.H{"id": doctorID, "name": result.DoctorName},
		"service":    gin.H{"id": serviceID, "name": result.ServiceName},
		"date":       result.Date,
		"time_range": result.TimeRange,
		"image_url":  result.PublicURL,
	})

}

func DeleteAppointment(c *gin.Context) {
	userID := c.GetInt("user_id")

	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}
	idStr := c.Param("id")
	appointmentID, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid appointment ID"})
		return
	}

	err = appointment.DeleteAppointment(c.Request.Context(), userID, appointmentID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Appointment deleted successfully"})
}

// GET /api/appointment/availability/day?date=YYYY-MM-DD
func GetDayAvailability(c *gin.Context) {
	dateStr := c.Query("date")
	if dateStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "date is required"})
		return
	}

	slots, err := appointment.GenerateDaySlots(dateStr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, slots)
}

// GetAppointmentsForAdmin ดึงข้อมูลคิวสำหรับ admin พร้อมข้อมูลเพิ่มเติม
func GetAppointmentsForAdmin(c *gin.Context) {
	dateStr := c.Query("date")
	if dateStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Date parameter is required"})
		return
	}

	rows, err := appointment.GetAppointmentsForAdmin(
		c.Request.Context(),
		dateStr,
	)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, rows)
}

// อัปเดตสถานะคิว
func UpdateAppointmentStatus(c *gin.Context) {
	appointmentIDStr := c.Param("id")

	var req struct {
		Status string `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	rowsAffected, err := appointment.UpdateAppointmentStatus(
		c.Request.Context(),
		appointmentIDStr,
		req.Status,
	)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "appointment not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Status updated successfully"})
}

// DeleteAppointmentForAdmin ลบคิวสำหรับ admin
func DeleteAppointmentForAdmin(c *gin.Context) {
	appointmentIDStr := c.Param("id")

	rowsAffected, err := appointment.DeleteAppointmentForAdmin(
		c.Request.Context(),
		appointmentIDStr,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Appointment not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Appointment deleted successfully"})
}
