package models

type Doctor struct {
	ID             int    `json:"id"`
	Name           string `json:"name"`
	Specialization string `json:"specialization"`
	Schedule       string `json:"schedule"`
	Status         SlotStatus
	ImageURL       string `json:"image_url"`
	//for schedule
	Service  string `json:"service"`
	Duration int    `json:"duration"` // นาที
	Start    string `json:"start,omitempty"`
}
