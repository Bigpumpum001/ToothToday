package services

import (
	"context"
	"fmt"
	"strings"
	"time"

	"toothtoday/internal/clients"
	"toothtoday/internal/db"
	"toothtoday/internal/models"
	"toothtoday/internal/repository"
)

func GetUsers(ctx context.Context) ([]models.User, error) {
	return repository.GetUsers(ctx)
}

func GetProfile(ctx context.Context, userID int) (models.ProfileResponse, error) {

	user, err := repository.GetProfileUser(ctx, userID)
	if err != nil {
		return models.ProfileResponse{}, err
	}

	appointments, err := repository.GetUsersAppointment(ctx, userID)
	if err != nil {
		return models.ProfileResponse{}, err
	}

	now := time.Now().In(db.Loc)

	for i := range appointments {
		a := &appointments[i]

		start := a.StartTime.In(db.Loc)
		end := start.Add(time.Duration(a.Duration) * time.Minute)

		a.Date = start.Format("2006-01-02")
		a.TimeRange = fmt.Sprintf("%02d:%02d-%02d:%02d",
			start.Hour(), start.Minute(),
			end.Hour(), end.Minute(),
		)

		if start.After(now) {
			a.IsPast = "current"
		} else {
			a.IsPast = "past"
		}

		// handle image
		if a.ImageURL != nil {
			trimmed := strings.TrimSpace(*a.ImageURL)
			if trimmed != "" {
				url := clients.GetFileURL(trimmed)
				a.ImageURL = &url
			} else {
				empty := ""
				a.ImageURL = &empty
			}
		} else {
			empty := ""
			a.ImageURL = &empty
		}
	}

	return models.ProfileResponse{
		User:         user,
		Appointments: appointments,
	}, nil
}

func UpdateProfile(ctx context.Context, userID int, input models.User) (models.User, error) {
	input.ID = userID
	return repository.UpdateProfile(ctx, input)
}
