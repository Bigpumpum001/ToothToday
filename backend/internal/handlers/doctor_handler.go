package handlers

import (
	"log"
	"net/http"
	"strconv"
	"toothtoday/internal/models"
	"toothtoday/internal/services"

	"github.com/gin-gonic/gin"
)

func GetDoctors(c *gin.Context) {
	doctors, err := services.GetDoctors(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error db"})
		return
	}

	c.JSON(http.StatusOK, doctors)
}

func CreateDoctor(c *gin.Context) {
	// Parse form data
	name := c.PostForm("name")
	specialization := c.PostForm("specialization")
	schedule := c.PostForm("schedule")

	// Validate required fields
	if name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Name is required"})
		return
	}

	file, _ := c.FormFile("file")
	id, err := services.CreateDoctor(c.Request.Context(), name, specialization, schedule, file)

	if err != nil {
		log.Printf("Error creating doctor: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create doctor"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Doctor created successfully",
		"id":      id,
	})
}

// DeleteDoctor soft deletes a doctor by ID (sets is_delete = true)
func DeleteDoctor(c *gin.Context) {
	idStr := c.Param("id")
	doctorID, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid doctor ID"})
		return
	}

	rowsAffected, err := services.SoftDeleteDoctor(c.Request.Context(), doctorID)
	if err != nil {
		log.Printf("Error soft deleting doctor: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete doctor"})
		return
	}

	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Doctor not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Doctor deleted successfully"})
}

func UpdateDoctor(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid doctor ID"})
		return
	}

	// Parse form data
	name := c.PostForm("name")
	specialization := c.PostForm("specialization")
	schedule := c.PostForm("schedule")

	// Validate required fields
	if name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Name is required"})
		return
	}

	file, _ := c.FormFile("file")

	rowsAffected, err := services.UpdateDoctor(
		c.Request.Context(),
		id,
		name,
		specialization,
		schedule,
		file,
	)

	if err != nil {
		log.Printf("Error updating doctor: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update doctor"})
		return
	}

	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Doctor not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Doctor updated successfully"})
}

func GetDoctorSchedules(c *gin.Context) {
	schedules, err := services.GetDoctorSchedules(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error db"})
		return
	}
	c.JSON(http.StatusOK, schedules)
}

func CreateDoctorSchedules(c *gin.Context) {
	var req models.DoctorSchedules

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.DoctorID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "DoctorID and DayOfWeek are required"})
		return
	}

	if req.StartTime == "" || req.EndTime == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "StartTime & EndTime are required"})
		return
	}
	if req.SlotInterval <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "SlotInterval (minutes) are required"})
		return
	}

	id, err := services.CreateDoctorSchedule(
		c.Request.Context(),
		req,
	)
	if err != nil {
		log.Printf("Error creating doctor schedule: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create doctor schedule"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Doctor schedule created successfully",
		"id":      id,
	})
}

func UpdateDoctorSchedule(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid schedule ID"})
		return
	}

	var req models.DoctorSchedules
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	rowsAffected, err := services.UpdateDoctorScheduleByID(
		c.Request.Context(),
		id,
		req,
	)

	if err != nil {
		log.Printf("Error updating doctor schedule: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update doctor schedule"})
		return
	}

	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Doctor schedule not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Doctor schedule updated successfully"})
}

func DeleteDoctorSchedule(c *gin.Context) {
	// อ่าน delete appoint อีกอันว่ากระทบมั้ย
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid appointment ID"})
		return
	}

	rowsAffected, err := services.DeleteDoctorScheduleByID(
		c.Request.Context(),
		id,
	)
	if err != nil {
		log.Printf("Error deleting doctor schedule: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete doctor schedule"})
		return
	}

	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Doctor schedule not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Appointment deleted successfully"})
}
