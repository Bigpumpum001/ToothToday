package repository

import (
	"context"
	"fmt"
	"toothtoday/internal/db"
	"toothtoday/internal/models"
)

func GetServices(ctx context.Context) ([]models.Service, error) {
	query := "select id,name,short_description,price_min,price_max,duration_minutes from services WHERE is_delete = false"
	rows, err := db.Pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var services []models.Service
	for rows.Next() {
		s := models.Service{}
		if err := rows.Scan(&s.ID, &s.Name, &s.Short_description, &s.Price_min, &s.Price_max, &s.Duration_minutes); err != nil {
			return nil, err
		}
		services = append(services, s)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return services, nil
}

func GetServicesContent(ctx context.Context) ([]models.ServiceContent, error) {
	rows, err := db.Pool.Query(ctx, `
	select title,content,image_url from services_content
	WHERE is_delete = false
	order by service_id asc
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var servicesContent []models.ServiceContent
	for rows.Next() {
		s := models.ServiceContent{}
		if err := rows.Scan(&s.Title, &s.Content, &s.ImageURL); err != nil {
			return nil, err
		}
		// s.ImageURL = storage.GetFileURL(s.ImageURL) //ย้ายไปใน service เพราะไม่ใช่ db logic
		servicesContent = append(servicesContent, s)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return servicesContent, nil
}

func GetServiceByID(ctx context.Context, id int) (*models.Service, error) {
	var s models.Service
	err := db.Pool.QueryRow(ctx, `
        select id,name,short_description,price_min,price_max,duration_minutes 
		from services
        WHERE id=$1
    `, id).Scan(&s.ID, &s.Name, &s.Short_description, &s.Price_min, &s.Price_max, &s.Duration_minutes)

	if err != nil {
		return nil, err
	}
	return &s, nil
}

func GetServicesWithContent(ctx context.Context) ([]models.ServiceWithContent, error) {
	rows, err := db.Pool.Query(ctx, `
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
		WHERE s.is_delete = false
		ORDER BY s.id ASC
	`)
	if err != nil {
		return nil, fmt.Errorf("query GetServicesWithContent: %w", err)
	}
	defer rows.Close()

	var services []models.ServiceWithContent

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
			return nil, fmt.Errorf("scan services with context: %w", err)
		}
		services = append(services, s)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("row iteration GetServicesWithContent: %w", err)
	}

	return services, nil
}

func InsertService(ctx context.Context, req models.ServiceWithContent) (int, error) {
	queryService := `
		INSERT INTO services (name, short_description, price_min, price_max, duration_minutes, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
		RETURNING id
	`
	var serviceID int
	err := db.Pool.QueryRow(ctx, queryService, req.Name, req.ShortDescription, req.PriceMin, req.PriceMax, req.DurationMinutes).Scan(&serviceID)
	if err != nil {
		return 0, fmt.Errorf("insert service : %w", err)
	}

	return serviceID, nil
}

func InsertServiceContent(ctx context.Context, serviceID int, req models.ServiceWithContent) (int, error) {
	queryServiceContent := `
		INSERT INTO services_content (service_id, title, content, image_url, created_at, updated_at)
		VALUES ($1, $2, $3,$4, NOW(), NOW())
		RETURNING id
	`

	var contentID int
	err := db.Pool.QueryRow(ctx, queryServiceContent, serviceID, req.Name, req.Content, req.ImageURL).Scan(&contentID)
	if err != nil {
		return 0, fmt.Errorf("insert service content : %w", err)
	}

	return contentID, nil
}

func UpdateService(ctx context.Context, serviceID int, req models.ServiceWithContent) (int64, error) {

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

	result, err := db.Pool.Exec(ctx, queryService, req.Name, req.ShortDescription, req.PriceMin, req.PriceMax, req.DurationMinutes, serviceID)
	if err != nil {
		return 0, fmt.Errorf("update service: %w", err)
	}

	rowsAffected := result.RowsAffected()

	return rowsAffected, nil
}

func UpdateServiceContent(ctx context.Context, serviceID int, req models.ServiceWithContent) (int64, error) {

	queryServiceContents := `
		UPDATE services_content 
		SET title = COALESCE(NULLIF($1, ''), title),
			content = COALESCE(NULLIF($2, ''), content),
			image_url = COALESCE(NULLIF($3, ''), image_url),
			updated_at = NOW()
		WHERE service_id = $4
	`

	result, err := db.Pool.Exec(ctx, queryServiceContents, req.Name, req.Content, req.ImageURL, serviceID)
	if err != nil {
		return 0, fmt.Errorf("update service content: %w", err)
	}

	rowsAffected := result.RowsAffected()

	return rowsAffected, nil
}

func SoftDeleteServiceContent(ctx context.Context, serviceID int) (int64, error) {
	// Soft delete the service (set is_delete = true)
	query := "UPDATE services SET is_delete = true, updated_at = NOW() WHERE id = $1"
	result, err := db.Pool.Exec(ctx, query, serviceID)
	if err != nil {
		return 0, fmt.Errorf("Failed to delete service : %w", err)
	}

	rowsAffected := result.RowsAffected()

	return rowsAffected, nil
}

func GetServiceName(serviceID int) string {
	var name string
	err := db.Pool.QueryRow(context.Background(), `SELECT name FROM services WHERE id=$1 and is_delete = false`, serviceID).Scan(&name)
	if err != nil {
		return ""
	}
	return name
}
