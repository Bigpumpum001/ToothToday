package models

import "time"

type Appointment struct {
	ID              int       `json:"id"`
	UserID          int       `json:"user_id"`
	DoctorID        int       `json:"doctor_id"`
	ServiceID       int       `json:"service_id"`
	AppointmentTime time.Time `json:"appointment_time"`
	Status          string    `json:"status"`
	Note            *string   `json:"note"`
	ImageURL        *string   `json:"image_url"`
	DurationMinutes int       // `json:"duration_minutes"`
	// return create appointment
	DoctorName  string `json:"doctor_name"`
	ServiceName string `json:"service_name"`
	TimeRange   string `json:"time_range"`
}
type DoctorAppointment struct {
	ID              int    `json:"id"`
	DoctorID        int    `json:"doctor_id"`
	ServiceID       int    `json:"service_id"`
	Start           string `json:"start_time"`
	DurationMinutes int    `json:"duration_minutes"`
	Status          string `json:"status"`
}
type ProfileAppointment struct {
	ID          int     `json:"id"`
	UserID      int     `json:"user_id"`
	DoctorName  string  `json:"doctor_name"`
	ServiceName string  `json:"service_name"`
	TimeRange   string  `json:"time_range"`
	Status      string  `json:"status"`
	Note        *string `json:"note"`
	ImageURL    *string `json:"image_url"`
	Date        string  `json:"date"`
	IsPast      string  `json:"is_past"`
}
