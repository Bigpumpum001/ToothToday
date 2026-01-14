package handlers

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"toothtoday/internal/db"
	"toothtoday/internal/models"
	"toothtoday/internal/storage"

	"github.com/gin-gonic/gin"
)

func GetServices(c *gin.Context) {
	rows, err := db.Pool.Query(c, "select id,name,short_description,price_min,price_max,duration_minutes from services WHERE is_delete = false")
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
	WHERE is_delete = false
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
		s.ImageURL = storage.GetFileURL(s.ImageURL)
		servicesContent = append(servicesContent, s)
	}
	if err := rows.Err(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "row iteration Error"})
		return
	}
	c.JSON(http.StatusOK, servicesContent)
}

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
	err := db.Pool.QueryRow(context.Background(), `SELECT name FROM services WHERE id=$1 and is_delete = false`, serviceID).Scan(&name)
	if err != nil {
		return ""
	}
	return name
}

func GetServicesWithContent(c *gin.Context) {
	rows, err := db.Pool.Query(c, `
		SELECT 
			s.id,
			s.name,
			s.short_description,
			s.price_min,
			s.price_max,
			s.duration_minutes,
			sc.title,
			sc.content,
			sc.image_url
		FROM services s
		LEFT JOIN services_content sc
		ON s.id = sc.service_id
		WHERE is_delete = false
		ORDER BY s.id ASC
	`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "db error"})
		return
	}
	defer rows.Close()

	services := []models.ServiceWithContent{}

	for rows.Next() {
		var s models.ServiceWithContent

		err := rows.Scan(
			&s.ID,
			&s.Name,
			&s.ShortDescription,
			&s.PriceMin,
			&s.PriceMax,
			&s.DurationMinutes,
			&s.Title,
			&s.Content,
			&s.ImageURL,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "scan error"})
			return
		}
		if s.ImageURL != nil {
			imageURL := storage.GetFileURL(*s.ImageURL)
			s.ImageURL = &imageURL
		}
		services = append(services, s)
	}

	if err := rows.Err(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "row iteration error"})
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

	var req models.ServiceWithContent
	req.Name = name
	req.ShortDescription = shortDescription
	req.PriceMin = priceMin
	req.PriceMax = priceMax
	req.DurationMinutes = durationMinutes
	req.Title = title
	req.Content = content

	dbImagePath := ""

	// ตรวจสอบว่ามีการอัปโหลดไฟล์หรือไม่
	fileHeader, err := c.FormFile("file")
	if err == nil && fileHeader != nil {
		filename := fileHeader.Filename
		// อัปโหลดไฟล์ไปยัง GCS
		objectPath := fmt.Sprintf("images/services-pic/%s", filename)
		if err := storage.UploadFile(fileHeader, objectPath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Upload failed"})
			return
		}
		dbImagePath = "/" + objectPath
	}
	req.ImageURL = &dbImagePath

	//INSERT Service
	queryService := `
		INSERT INTO services (name, short_description, price_min, price_max, duration_minutes, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
		RETURNING id
	`
	var serviceID int
	err = db.Pool.QueryRow(c, queryService, req.Name, req.ShortDescription, req.PriceMin, req.PriceMax, req.DurationMinutes).Scan(&serviceID)
	if err != nil {
		log.Printf("Error creating service: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create service content"})
		return
	}
	//INSERT ServiceContent
	queryServiceContent := `
		INSERT INTO services_content (service_id, title, content, image_url, created_at, updated_at)
		VALUES ($1, $2, $3,$4, NOW(), NOW())
		RETURNING id
	`
	var contentID int
	err = db.Pool.QueryRow(c, queryServiceContent, serviceID, req.Name, req.Content, req.ImageURL).Scan(&contentID)
	if err != nil {
		log.Printf("Error creating service content: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create service content"})
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

	var req models.ServiceWithContent
	req.Name = name
	req.ShortDescription = shortDescription
	req.PriceMin = priceMin
	req.PriceMax = priceMax
	req.DurationMinutes = durationMinutes
	req.Content = content

	dbImagePath := ""
	// ตรวจสอบว่ามีการอัปโหลดไฟล์หรือไม่
	fileHeader, err := c.FormFile("file")
	if err == nil && fileHeader != nil {
		filename := fileHeader.Filename
		// อัปโหลดไฟล์ไปยัง GCS
		objectPath := fmt.Sprintf("images/services-pic/%s", filename)
		if err := storage.UploadFile(fileHeader, objectPath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Upload failed"})
			return
		}
		dbImagePath = "/" + objectPath
	}
	req.ImageURL = &dbImagePath

	queryServiceContents := `
		UPDATE services_content 
		SET title = COALESCE(NULLIF($1, ''), title),
			content = COALESCE(NULLIF($2, ''), content),
			image_url = COALESCE(NULLIF($3, ''), image_url),
			updated_at = NOW()
		WHERE service_id = $4
	`

	result, err := db.Pool.Exec(c, queryServiceContents, req.Name, req.Content, req.ImageURL, serviceID)
	if err != nil {
		log.Printf("Error updating service content: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update service content"})
		return
	}

	rowsAffected := result.RowsAffected()

	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Service content not found"})
		return
	}

	queryService := `
		UPDATE services 
		SET name = COALESCE(NULLIF($1, ''), name),
			short_description = COALESCE(NULLIF($2, ''), short_description),
			price_min = COALESCE(NULLIF($3, 0), price_min),
			price_max = COALESCE(NULLIF($4, 0), price_max),
			duration_minutes = COALESCE(NULLIF($5, 0), duration_minutes),
			updated_at = NOW()
		WHERE id = $6
	`

	result1, err := db.Pool.Exec(c, queryService, req.Name, req.ShortDescription, req.PriceMin, req.PriceMax, req.DurationMinutes, serviceID)
	if err != nil {
		log.Printf("Error updating service content: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update service content"})
		return
	}

	rowsAffected1 := result1.RowsAffected()

	if rowsAffected1 == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Service not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Service content updated successfully"})
}

// DeleteServiceContent soft deletes a service by ID (sets is_delete = true)
func DeleteServiceContent(c *gin.Context) {
	idStr := c.Param("id")
	serviceID, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid service ID"})
		return
	}

	// Soft delete the service (set is_delete = true)
	query := "UPDATE services SET is_delete = true, updated_at = NOW() WHERE id = $1"
	result, err := db.Pool.Exec(c, query, serviceID)
	if err != nil {
		log.Printf("Error soft deleting service: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete service"})
		return
	}

	rowsAffected := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Service not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Service deleted successfully"})
}
