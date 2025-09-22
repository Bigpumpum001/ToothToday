package handlers

import (
	"net/http"
	"toothtoday/internal/db"
	"toothtoday/internal/models"

	"github.com/gin-gonic/gin"
)

func GetDoctors(c *gin.Context) {
	rows, err := db.Pool.Query(c, "select id,name,specialization,schedule,image_url from doctors")
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
		doctors = append(doctors, d)
	}
	c.JSON(http.StatusOK, doctors)
}
