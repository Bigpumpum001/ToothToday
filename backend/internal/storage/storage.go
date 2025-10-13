package storage

import (
	"context"
	"fmt"
	"io"
	"mime/multipart"
	"os"

	"cloud.google.com/go/storage"
)

var (
	client     *storage.Client
	bucketName string
)

func InitStorage() error {
	ctx := context.Background()
	bucketName = os.Getenv("GCS_BUCKET_NAME")
	// cred := os.Getenv("GCS_CREDENTIALS_JSON")

	var err error
	// os.Setenv("GOOGLE_APPLICATION_CREDENTIALS", cred)
	client, err = storage.NewClient(ctx)
	if err != nil {
		return fmt.Errorf("failed to create storage client: %v", err)
	}
	return nil
}
func UploadFile(fileHeader *multipart.FileHeader, objectPath string) error {
	ctx := context.Background()
	file, err := fileHeader.Open()
	if err != nil {
		return fmt.Errorf("failed to open file: %v", err)
	}
	defer file.Close()

	wc := client.Bucket(bucketName).Object(objectPath).NewWriter(ctx)
	wc.ContentType = fileHeader.Header.Get("Content-Type")
	// wc.ACL = []storage.ACLRule{{Entity: storage.AllUsers, Role: storage.RoleReader}}

	if _, err := io.Copy(wc, file); err != nil {
		wc.Close()
		return fmt.Errorf("failed to write to bucket: %v", err)
	}

	if err := wc.Close(); err != nil {
		return fmt.Errorf("failed to close writer: %v", err)
	}

	return nil
}

// GET public
func GetFileURL(objectName string) string {
	// fmt.Println("d", fmt.Sprintf("https://storage.googleapis.com/%s%s", bucketName, objectName))
	return fmt.Sprintf("https://storage.googleapis.com/%s%s", bucketName, objectName)
}

// func GetFileURL2(objectName string) string {
// 	url, err := GetSignedURL(objectName, 7*36*time.Minute) // 15 นาที
// 	if err != nil {
// 		// fallback ถ้า error
// 		fmt.Println("Failed to create signed URL:", err)
// 		return ""
// 	}
// 	return url
// }

// func GetSignedURL(objectName string, duration time.Duration) (string, error) {
// 	opts := &storage.SignedURLOptions{
// 		Method:  "GET",
// 		Expires: time.Now().Add(duration),
// 		// Credential จาก ADC หรือ JSON key
// 	}
// 	return storage.SignedURL(bucketName, objectName, opts)
// }
