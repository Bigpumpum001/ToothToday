package models

import (
	"context"
	"toothtoday/internal/db"
)

type Service struct {
	ID                int     `json:"id"`
	Name              string  `json:"name"`
	Short_description string  `json:"short_description"`
	Price_min         float64 `json:"price_min"`
	Price_max         float64 `json:"price_max"`
	Duration_minutes  int     `json:"duration_minutes"`
}
type ServiceContent struct {
	Title    string `json:"title"`
	Content  string `json:"content"`
	ImageURL string `json:"image_url"`
}

func GetServiceByID(id int) (*Service, error) {
	var s Service
	err := db.Pool.QueryRow(context.Background(), `
        select id,name,short_description,price_min,price_max,duration_minutes 
		from services
        WHERE id=$1
    `, id).Scan(&s.ID, &s.Name, &s.Short_description, &s.Price_min, &s.Price_max, &s.Duration_minutes)

	if err != nil {
		return nil, err
	}
	return &s, nil
}
