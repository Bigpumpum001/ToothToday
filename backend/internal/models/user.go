package models

type User struct {
	ID              int     `json:"id"`
	Name            string  `json:"name"`
	Phone           string  `json:"phone"`
	Age             int     `json:"age"`
	Role            string  `json:"role"`
	Email           string  `json:"email"`
	ChronicDisease  string  `json:"chronic_disease"`
	LineUserID      *string `json:"line_user_id"`
	LineDisplayName *string `json:"line_display_name"`
	LinePictureUrl  *string `json:"line_picture_url"`
}
type ProfileResponse struct {
	User         User                 `json:"user"`
	Appointments []ProfileAppointment `json:"appointments"`
}
