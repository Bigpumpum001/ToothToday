package handlers

import (
	"log"
	"net/http"
	"strconv"
	"toothtoday/internal/services"

	"github.com/gin-gonic/gin"
)

func GetServices(c *gin.Context) { //ไม่ได้ใช้แล้ว
	services, err := services.GetServices(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"Error": "Error db"})
		return
	}
	c.JSON(http.StatusOK, services)
}

func GetServicesContent(c *gin.Context) {
	servicesContent, err := services.GetServicesContent(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error db"})
		return
	}

	c.JSON(http.StatusOK, servicesContent)
}

func GetServiceByID(c *gin.Context) {
	idStr := c.Param("id")
	serviceID, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid serviceID"})
		return
	}
	service, err := services.GetServiceByID(c.Request.Context(), serviceID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "service not found"})
		return
	}
	c.JSON(http.StatusOK, service)
}

func GetServicesWithContent(c *gin.Context) {
	services, err := services.GetServicesWithContent(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "db error"})
		return
	}

	c.JSON(http.StatusOK, services)
}

// CreateServiceContent
func CreateServiceContent(c *gin.Context) {
	// Parse form data
	name := c.PostForm("name")
	shortDescription := c.PostForm("short_description")
	priceMinStr := c.PostForm("price_min")
	priceMaxStr := c.PostForm("price_max")
	durationMinutesStr := c.PostForm("duration_minutes")
	title := c.PostForm("title")
	content := c.PostForm("content")

	// Validate required fields
	if name == "" || content == "" || shortDescription == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Name, content, and short description are required"})
		return
	}

	// Parse numbers
	priceMin, err := strconv.ParseFloat(priceMinStr, 64)
	if err != nil || priceMin <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or missing minimum price"})
		return
	}

	priceMax, err := strconv.ParseFloat(priceMaxStr, 64)
	if err != nil || priceMax <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or missing maximum price"})
		return
	}

	// Validate price range
	if priceMin > priceMax {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Minimum price cannot be greater than maximum price"})
		return
	}

	durationMinutes, err := strconv.Atoi(durationMinutesStr)
	if err != nil || durationMinutes <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or missing duration minutes"})
		return
	}

	file, _ := c.FormFile("file")

	// Call service
	serviceID, err := services.CreateServiceWithContentForm(
		c.Request.Context(),
		name,
		shortDescription,
		priceMin,
		priceMax,
		durationMinutes,
		title,
		content,
		file,
	)
	if err != nil {
		log.Printf("Error creating service content: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create service content",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Service content created successfully",
		"id":      serviceID,
	})
}

// UpdateServiceContent อัปเดตเนื้อหาบริการ
func UpdateServiceContent(c *gin.Context) {
	idStr := c.Param("id")
	serviceID, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid service ID"})
		return
	}

	// Parse form data
	name := c.PostForm("name")
	shortDescription := c.PostForm("short_description")
	priceMinStr := c.PostForm("price_min")
	priceMaxStr := c.PostForm("price_max")
	durationMinutesStr := c.PostForm("duration_minutes")
	content := c.PostForm("content")

	// Parse numbers for validation
	var priceMin, priceMax float64
	var durationMinutes int

	if priceMinStr != "" {
		priceMin, err = strconv.ParseFloat(priceMinStr, 64)
		if err != nil || priceMin <= 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid minimum price"})
			return
		}
	}

	if priceMaxStr != "" {
		priceMax, err = strconv.ParseFloat(priceMaxStr, 64)
		if err != nil || priceMax <= 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid maximum price"})
			return
		}
	}

	// Validate price range if both are provided
	if priceMin > 0 && priceMax > 0 && priceMin > priceMax {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Minimum price cannot be greater than maximum price"})
		return
	}

	if durationMinutesStr != "" {
		durationMinutes, err = strconv.Atoi(durationMinutesStr)
		if err != nil || durationMinutes <= 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid duration minutes"})
			return
		}
	}

	file, _ := c.FormFile("file")

	// Call service
	rowService, rowContent, err := services.UpdateServiceWithContent(
		c.Request.Context(),
		serviceID,
		name,
		shortDescription,
		priceMin,
		priceMax,
		durationMinutes,
		content,
		file,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update service"})
		return
	}

	if rowService == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Service not found"})
		return
	}

	if rowContent == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Service content not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Service content updated successfully"})
}

// DeleteServiceContent soft deletes a service by ID (sets is_delete = true)
func SoftDeleteServiceContent(c *gin.Context) {
	idStr := c.Param("id")
	serviceID, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid service ID"})
		return
	}

	rowsAffected, err := services.SoftDeleteServiceContent(c.Request.Context(), serviceID)
	if err != nil {
		log.Printf("Error soft deleting service: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete service"})
		return
	}

	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Service not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Service deleted successfully"})
}
