package handlers

import (
	"fmt"
	"net/http"
	"time"
	"toothtoday/internal/db"
	"toothtoday/internal/models"

	"github.com/gin-gonic/gin"
)

func GetUsers(c *gin.Context) {
	rows, err := db.Pool.Query(c, "SELECT id,name,phone,age,role,email FROM users")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "DB error"})
		return
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var u models.User
		if err := rows.Scan(&u.ID, &u.Name, &u.Phone, &u.Age, &u.Role, &u.Email); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "DB scan error"})
			return
		}
		users = append(users, u)
	}
	c.JSON(http.StatusOK, users)
}
func GetProfile(c *gin.Context) {
	userID := c.GetInt("user_id")
	// fmt.Println("userID", userID)
	var user models.User

	err := db.Pool.QueryRow(c, `
	select name,email,role,phone,chronic_disease,age from users where id=$1
	`, userID).Scan(&user.Name, &user.Email, &user.Role, &user.Phone, &user.ChronicDisease, &user.Age)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User not found"})
		return
	}

	rows, err := db.Pool.Query(c,
		`SELECT a.id, a.appointment_time, a.status, a.image_url, a.duration_minutes,
                d.name as doctor_name, s.name as service_name,a.note
        FROM appointments a
        JOIN doctors d ON a.doctor_id = d.id
        JOIN services s ON a.service_id = s.id
        WHERE a.user_id=$1
        ORDER BY a.appointment_time DESC`,
		userID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()
	var appointments []models.ProfileAppointment
	now := time.Now()
	for rows.Next() {
		var a models.ProfileAppointment
		var start time.Time
		var duration int
		if err := rows.Scan(&a.ID, &start, &a.Status, &a.ImageURL, &duration, &a.DoctorName, &a.ServiceName, &a.Note); err != nil {
			continue
		}

		a.Date = start.Format("2006-01-02")

		// คำนวณช่วงเวลา
		end := start.Add(time.Duration(duration) * time.Minute)
		a.TimeRange = fmt.Sprintf("%02d:%02d-%02d:%02d",
			start.Hour(), start.Minute(),
			end.Hour(), end.Minute(),
		)
		// แยก current / past
		if start.After(now) {
			a.Status = "current"
		} else {
			a.Status = "past"
		}

		appointments = append(appointments, a)
	}
	// fmt.Println("appointments", appointments)
	response := models.ProfileResponse{
		User:         user,
		Appointments: appointments,
	}
	c.JSON(http.StatusOK, response)

}

// PUT /users/me
func UpdateProfile(c *gin.Context) {
	userID := c.GetInt("user_id") // จาก JWT middleware
	// fmt.Println("userID e", userID)
	// struct สำหรับรับ JSON body
	var input struct {
		Name           string `json:"name"`
		Email          string `json:"email"`
		Phone          string `json:"phone"`
		ChronicDisease string `json:"chronic_disease"`
		Age            int    `json:"age"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	// update database
	_, err := db.Pool.Exec(c,
		`UPDATE users 
         SET name=$1, email=$2, phone=$3, chronic_disease=$4, age=$5 
         WHERE id=$6`,
		input.Name, input.Email, input.Phone, input.ChronicDisease, input.Age, userID,
	)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// ส่งข้อมูลกลับ frontend
	c.JSON(200, gin.H{
		"id":             userID,
		"name":           input.Name,
		"email":          input.Email,
		"phone":          input.Phone,
		"chronicDisease": input.ChronicDisease,
		"age":            input.Age,
	})
}
