package services

import (
	"context"
	"fmt"
	"mime/multipart"

	"toothtoday/internal/clients"
	"toothtoday/internal/models"
	"toothtoday/internal/repository"
)

func GetServices(ctx context.Context) ([]models.Service, error) {
	return repository.GetServices(ctx)
}

func GetServicesContent(ctx context.Context) ([]models.ServiceContent, error) {
	contents, err := repository.GetServicesContent(ctx)
	if err != nil {
		return nil, err
	}

	//  map image url
	for i := range contents {
		contents[i].ImageURL = clients.GetFileURL(contents[i].ImageURL)
	}

	return contents, nil
}

func GetServiceByID(ctx context.Context, id int) (*models.Service, error) {
	return repository.GetServiceByID(ctx, id)
}

func GetServicesWithContent(ctx context.Context) ([]models.ServiceWithContent, error) {
	services, err := repository.GetServicesWithContent(ctx)
	if err != nil {
		return nil, err
	}

	// map image url
	for i := range services {
		if services[i].ImageURL != nil {
			imageURL := clients.GetFileURL(*services[i].ImageURL)
			services[i].ImageURL = &imageURL
		}
	}

	return services, nil
}

func CreateServiceWithContentForm(
	ctx context.Context,
	name string,
	shortDescription string,
	priceMin float64,
	priceMax float64,
	durationMinutes int,
	title string,
	content string,
	file *multipart.FileHeader,
) (int, error) {

	dbImagePath := ""

	// upload file
	if file != nil {
		objectPath := fmt.Sprintf("images/services-pic/%s", file.Filename)
		if err := clients.UploadFile(file, objectPath); err != nil {
			return 0, err
		}
		dbImagePath = "/" + objectPath
	}

	req := models.ServiceWithContent{
		Name:             name,
		ShortDescription: shortDescription,
		PriceMin:         priceMin,
		PriceMax:         priceMax,
		DurationMinutes:  durationMinutes,
		Title:            title,
		Content:          content,
		ImageURL:         &dbImagePath,
	}

	// 1. insert service
	serviceID, err := repository.InsertService(ctx, req)
	if err != nil {
		return 0, err
	}

	// 2. insert content
	_, err = repository.InsertServiceContent(ctx, serviceID, req)
	if err != nil {
		return 0, err
	}

	return serviceID, nil
}

func UpdateServiceWithContent(
	ctx context.Context,
	serviceID int,
	name string,
	shortDescription string,
	priceMin float64,
	priceMax float64,
	durationMinutes int,
	content string,
	file *multipart.FileHeader,
) (int64, int64, error) {

	dbImagePath := ""

	// upload file (business logic)
	if file != nil {
		objectPath := fmt.Sprintf("images/services-pic/%s", file.Filename)

		if err := clients.UploadFile(file, objectPath); err != nil {
			return 0, 0, err
		}

		dbImagePath = "/" + objectPath
	}

	req := models.ServiceWithContent{
		Name:             name,
		ShortDescription: shortDescription,
		PriceMin:         priceMin,
		PriceMax:         priceMax,
		DurationMinutes:  durationMinutes,
		Content:          content,
		ImageURL:         &dbImagePath,
	}

	// update service
	rowService, err := repository.UpdateService(ctx, serviceID, req)
	if err != nil {
		return 0, 0, err
	}

	// update service content
	rowContent, err := repository.UpdateServiceContent(ctx, serviceID, req)
	if err != nil {
		return rowService, 0, err
	}

	return rowService, rowContent, nil
}

func SoftDeleteServiceContent(ctx context.Context, serviceID int) (int64, error) {
	return repository.SoftDeleteServiceContent(ctx, serviceID)
}
