package models

type User struct {
	ID             int    `json:"id"`
	Name           string `json:"name"`
	Phone          string `json:"phone"`
	Age            int    `json:"age"`
	Role           string `json:"role"`
	Email          string `json:"email"`
	ChronicDisease string `json:"chronic_disease"`
}
type ProfileResponse struct {
	User         User                 `json:"user"`
	Appointments []ProfileAppointment `json:"appointments"`
}
