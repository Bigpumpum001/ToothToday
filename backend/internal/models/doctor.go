package models

type Doctor struct {
	ID             int    `json:"id"`
	Name           string `json:"name"`
	Specialization string `json:"specialization"`
	Schedule       string `json:"schedule"`
	Status         SlotStatus
	ImageURL       string `json:"image_url"`
	IsDelete       bool   `json:"is_delete"`
	//for schedule
	Service  string `json:"service"`
	Duration int    `json:"duration"` // นาที
	Start    string `json:"start,omitempty"`
}

type DoctorSchedules struct {
	ID             int    `json:"id"`
	DoctorID       int    `json:"doctor_id"`
	DoctorName     string `json:"doctor_name"`
	DayOfWeek      int    `json:"day_of_week"`
	StartTime      string `json:"start_time"`
	EndTime        string `json:"end_time"`
	SlotInterval   int    `json:"slot_interval"` // นาที
	Specialization string `json:"specialization"`
}
