package models

type Slot struct {
	Time     string     `json:"time"`
	Status   SlotStatus `json:"status"`
	Doctors  []Doctor   `json:"doctors"`
	Duration int        `json:"duration,omitempty"`
}
type DayAvailability struct {
	Date   string `json:"date"`
	Slots  []Slot `json:"slots"`
	Status string `json:"status"`
}
type MonthAvailability struct {
	Month string            `json:"month"`
	Days  []DayAvailability `json:"days"`
}

type SlotStatus string

const (
	Available   SlotStatus = "available"
	Booked      SlotStatus = "booked"
	Pending     SlotStatus = "pending"
	Blocked     SlotStatus = "blocked"
	NoShow      SlotStatus = "no_show"
	FullyBooked SlotStatus = "fully_booked"
	NearlyFull  SlotStatus = "nearly_full"
	Closed      SlotStatus = "closed"
	Passed      SlotStatus = "passed"
)
