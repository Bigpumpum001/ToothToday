package models

import (
	"mime/multipart"
	"time"
)

type Appointment struct {
	// db fields
	ID              int       `json:"id"`
	UserID          int       `json:"user_id"`
	DoctorID        int       `json:"doctor_id"`
	ServiceID       int       `json:"service_id"`
	AppointmentTime time.Time `json:"appointment_time"`
	Status          string    `json:"status"`
	Note            *string   `json:"note"`
	ImageURL        *string   `json:"image_url"`
	DurationMinutes int       // `json:"duration_minutes"`
	IsDelete        bool      `json:"is_delete"`

	// return create appointment (Response fields)
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
	IsDelete    bool    `json:"is_delete"`

	StartTime time.Time `json:"-"`
	Duration  int       `json:"-"`
}
type AppointmentForAdmin struct {
	ID              int       `json:"id"`
	UserName        string    `json:"user_name"`
	DoctorName      string    `json:"doctor_name"`
	ServiceName     string    `json:"service_name"`
	TimeRange       string    `json:"time_range"`
	AppointmentTime time.Time `json:"appointment_time"`
	Status          string    `json:"status"`
	Note            *string   `json:"note"`
	ImageURL        *string   `json:"image_url"`
	DurationMinutes int       `json:"duration_minutes"`
	IsDelete        bool      `json:"is_delete"`
}

type CreateAppointmentInput struct {
	UserID          int
	DoctorID        int
	ServiceID       int
	AppointmentTime time.Time
	Status          string
	Note            string
	FileHeader      *multipart.FileHeader
}

type CreateAppointmentResult struct {
	DoctorName  string
	ServiceName string
	Date        string
	PublicURL   string
	TimeRange   string
}

type AppointmentDetail struct {
	DoctorName      string
	ServiceName     string
	AppointmentTime time.Time
	DurationMinutes int
}
