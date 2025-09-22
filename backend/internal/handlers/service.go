package handlers

import (
	"context"
	"net/http"
	"strconv"
	"toothtoday/internal/db"
	"toothtoday/internal/models"

	"github.com/gin-gonic/gin"
)

func GetServices(c *gin.Context) {
	rows, err := db.Pool.Query(c, "select id,name,short_description,price_min,price_max,duration_minutes from services")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error db"})
		return
	}
	defer rows.Close()
	services := []models.Service{}
	for rows.Next() {
		s := models.Service{}
		if err := rows.Scan(&s.ID, &s.Name, &s.Short_description, &s.Price_min, &s.Price_max, &s.Duration_minutes); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "db scan error  "})
			return
		}
		services = append(services, s)
	}
	if err := rows.Err(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Row iteration error"})
		return
	}
	c.JSON(http.StatusOK, services)
}
func GetServicesContent(c *gin.Context) {
	rows, err := db.Pool.Query(c, `
	select title,content,image_url from services_content
	order by service_id asc
	`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error db"})
		return
	}
	defer rows.Close()
	servicesContent := []models.ServiceContent{}
	for rows.Next() {
		s := models.ServiceContent{}
		if err := rows.Scan(&s.Title, &s.Content, &s.ImageURL); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "db scan error "})
			return
		}
		servicesContent = append(servicesContent, s)
	}
	if err := rows.Err(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "row iteration Error"})
		return
	}
	c.JSON(http.StatusOK, servicesContent)
}

// func GetServiceByID(serviceID int) {
// 	var durationMinutes int
// 	err := db.Pool.QueryRow(context.Background(), `
// 	select duration_minutes from services
// 	where id = $1
// 	`, serviceID).Scan(&durationMinutes)
// 	if err != nil {
// 		log.Println("getServiceByID error:", err)

// 		return 0
// 	}

//		return durationMinutes
//	}
func GetServiceByID(c *gin.Context) {
	idStr := c.Param("id")
	serviceID, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"serviceID": "serviceID"})
		return
	}
	service, err := models.GetServiceByID(serviceID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "service not found"})
		return
	}
	c.JSON(http.StatusOK, service)
}
func getServiceName(serviceID int) string {
	var name string
	err := db.Pool.QueryRow(context.Background(), `SELECT name FROM services WHERE id=$1`, serviceID).Scan(&name)
	if err != nil {
		return ""
	}
	return name
}
