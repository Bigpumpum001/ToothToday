package handlers

import (
	"fmt"
	"log"
	"net/http"
	"strconv"
	"toothtoday/internal/db"
	"toothtoday/internal/models"
	"toothtoday/internal/storage"

	"github.com/gin-gonic/gin"
)

func GetDoctors(c *gin.Context) {
	rows, err := db.Pool.Query(c, "select id,name,specialization,schedule,image_url from doctors WHERE is_delete = false")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error db"})
		return
	}
	defer rows.Close()
	var doctors []models.Doctor
	for rows.Next() {
		var d models.Doctor
		if err := rows.Scan(&d.ID, &d.Name, &d.Specialization, &d.Schedule, &d.ImageURL); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "DB scan error "})
			return
		}

		d.ImageURL = storage.GetFileURL(d.ImageURL)
		doctors = append(doctors, d)
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

	var req models.Doctor
	req.Name = name
	req.Specialization = specialization
	req.Schedule = schedule

	dbImagePath := ""
	// ตรวจสอบว่ามีการอัปโหลดไฟล์หรือไม่
	fileHeader, err := c.FormFile("file")
	if err == nil && fileHeader != nil {
		filename := fileHeader.Filename
		// อัปโหลดไฟล์ไปยัง GCS
		objectPath := fmt.Sprintf("images/doctors/%s", filename)
		if err := storage.UploadFile(fileHeader, objectPath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Upload failed"})
			return
		}
		dbImagePath = "/" + objectPath
	}
	req.ImageURL = dbImagePath

	//INSERT Doctor
	query := `
		INSERT INTO doctors (name, specialization, schedule, image_url, created_at, updated_at)
		VALUES ($1, $2, $3, $4, NOW(), NOW())
		RETURNING id
	`
	var id int
	err = db.Pool.QueryRow(c, query, req.Name, req.Specialization, req.Schedule, req.ImageURL).Scan(&id)
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

	// Soft delete the doctor (set is_delete = true)
	query := "UPDATE doctors SET is_delete = true, updated_at = NOW() WHERE id = $1"
	result, err := db.Pool.Exec(c, query, doctorID)
	if err != nil {
		log.Printf("Error soft deleting doctor: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete doctor"})
		return
	}

	rowsAffected := result.RowsAffected()
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

	var req models.Doctor
	req.Name = name
	req.Specialization = specialization
	req.Schedule = schedule

	dbImagePath := ""
	// ตรวจสอบว่ามีการอัปโหลดไฟล์หรือไม่
	fileHeader, err := c.FormFile("file")
	if err == nil && fileHeader != nil {
		filename := fileHeader.Filename
		// อัปโหลดไฟล์ไปยัง GCS
		objectPath := fmt.Sprintf("images/doctors/%s", filename)
		if err := storage.UploadFile(fileHeader, objectPath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Upload failed"})
			return
		}
		dbImagePath = "/" + objectPath
	}

	// อัปเดตข้อมูล
	query := `
		UPDATE doctors 
		SET name = COALESCE(NULLIF($1, ''), name),
			specialization = COALESCE(NULLIF($2, ''), specialization),
			schedule = COALESCE(NULLIF($3, ''), schedule),
			image_url = COALESCE(NULLIF($4, ''), image_url),
			updated_at = NOW()
		WHERE id = $5
	`

	result, err := db.Pool.Exec(c, query, req.Name, req.Specialization, req.Schedule, dbImagePath, id)
	if err != nil {
		log.Printf("Error updating doctor: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update doctor"})
		return
	}

	rowsAffected := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Doctor not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Doctor updated successfully"})
}

func GetDoctorSchedules(c *gin.Context) {
	rows, err := db.Pool.Query(c, "select id,doctor_id,day_of_week,start_time,end_time,slot_interval from doctor_schedules")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error db"})
		return
	}
	defer rows.Close()
	var schedules []models.DoctorSchedules
	for rows.Next() {
		var d models.DoctorSchedules
		if err := rows.Scan(&d.ID, &d.DoctorID, &d.DayOfWeek, &d.StartTime, &d.EndTime, &d.SlotInterval); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "DB scan error "})
			return
		}
		schedules = append(schedules, d)
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

	//INSERT Service
	query := `
		INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, slot_interval)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id
	`
	var id int
	err := db.Pool.QueryRow(c, query, req.DoctorID, req.DayOfWeek, req.StartTime, req.EndTime, req.SlotInterval).Scan(&id)
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

	// อัปเดตข้อมูล
	query := `
		UPDATE doctor_schedules 
		SET day_of_week = COALESCE($1, day_of_week),
			start_time = COALESCE(NULLIF($2,'')::time, start_time),
			end_time = COALESCE(NULLIF($3,'')::time, end_time),
			slot_interval = COALESCE(NULLIF($4, 0), slot_interval),
			doctor_id = COALESCE(NULLIF($6, 0), doctor_id)
		WHERE id = $5`

	result, err := db.Pool.Exec(c, query, req.DayOfWeek, req.StartTime, req.EndTime, req.SlotInterval, id, req.DoctorID)
	if err != nil {
		log.Printf("Error updating doctor schedule: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update doctor schedule"})
		return
	}

	rowsAffected := result.RowsAffected()
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

	result, err := db.Pool.Exec(c, `
        DELETE FROM doctor_schedules 
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
