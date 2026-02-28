package models

type Service struct {
	ID                int     `json:"id"`
	Name              string  `json:"name"`
	Short_description string  `json:"short_description"`
	Price_min         float64 `json:"price_min"`
	Price_max         float64 `json:"price_max"`
	Duration_minutes  int     `json:"duration_minutes"`
	IsDelete          bool    `json:"is_delete"`
}
type ServiceContent struct {
	Title    string `json:"title"`
	Content  string `json:"content"`
	ImageURL string `json:"image_url"`
}
type ServiceWithContent struct {
	ID               int     `json:"id"`
	Name             string  `json:"name"`
	ShortDescription string  `json:"short_description"`
	PriceMin         float64 `json:"price_min"`
	PriceMax         float64 `json:"price_max"`
	DurationMinutes  int     `json:"duration_minutes"`
	IsDelete         bool    `json:"is_delete"`

	Title    string  `json:"title"`
	Content  string  `json:"content"`
	ImageURL *string `json:"image_url"`
}
