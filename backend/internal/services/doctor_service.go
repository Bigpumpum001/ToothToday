package services

import (
	"context"
	"fmt"
	"mime/multipart"

	"toothtoday/internal/clients"
	"toothtoday/internal/models"
	"toothtoday/internal/repository"
)

func GetDoctors(ctx context.Context) ([]models.Doctor, error) {
	doctors, err := repository.GetDoctors(ctx)
	if err != nil {
		return nil, err
	}

	for i := range doctors {
		doctors[i].ImageURL = clients.GetFileURL(doctors[i].ImageURL)
	}

	return doctors, nil
}

func CreateDoctor(
	ctx context.Context,
	name string,
	specialization string,
	schedule string,
	file *multipart.FileHeader,
) (int, error) {

	dbImagePath := ""

	if file != nil {
		objectPath := fmt.Sprintf("images/doctors/%s", file.Filename)
		if err := clients.UploadFile(file, objectPath); err != nil {
			return 0, err
		}
		dbImagePath = "/" + objectPath
	}

	req := models.Doctor{
		Name:           name,
		Specialization: specialization,
		Schedule:       schedule,
		ImageURL:       dbImagePath,
	}

	return repository.CreateDoctor(ctx, req)
}

func UpdateDoctor(
	ctx context.Context,
	id int,
	name string,
	specialization string,
	schedule string,
	file *multipart.FileHeader,
) (int64, error) {

	dbImagePath := ""

	if file != nil {
		objectPath := fmt.Sprintf("images/doctors/%s", file.Filename)
		if err := clients.UploadFile(file, objectPath); err != nil {
			return 0, err
		}
		dbImagePath = "/" + objectPath
	}

	req := models.Doctor{
		Name:           name,
		Specialization: specialization,
		Schedule:       schedule,
	}

	return repository.UpdateDoctor(ctx, id, req, dbImagePath)
}

func SoftDeleteDoctor(ctx context.Context, id int) (int64, error) {
	return repository.SoftDeleteDoctor(ctx, id)
}

func GetDoctorSchedules(ctx context.Context) ([]models.DoctorSchedules, error) {
	return repository.GetDoctorSchedules(ctx)
}

func CreateDoctorSchedule(
	ctx context.Context,
	req models.DoctorSchedules,
) (int, error) {
	return repository.CreateDoctorSchedule(ctx, req)
}

func UpdateDoctorScheduleByID(
	ctx context.Context,
	id int,
	req models.DoctorSchedules,
) (int64, error) {
	return repository.UpdateDoctorScheduleByID(
		ctx,
		id,
		req.DayOfWeek,
		req.StartTime,
		req.EndTime,
		req.SlotInterval,
		req.DoctorID,
	)
}

func DeleteDoctorScheduleByID(ctx context.Context, id int) (int64, error) {
	return repository.DeleteDoctorScheduleByID(ctx, id)
}
