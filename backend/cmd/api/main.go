package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"toothtoday/internal/db"
	"toothtoday/internal/handlers"
	"toothtoday/internal/handlers/jobs"
	"toothtoday/internal/middleware"
	"toothtoday/internal/storage"
	"toothtoday/services"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	if os.Getenv("GO_ENV") != "production" {
		if err := godotenv.Load(".env.local"); err != nil {
			log.Println("No .env file found")
		}
	}

	allowOrigins := []string{
		os.Getenv("FRONTEND_URL"),
	}
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	//line
	if err := services.InitLineBot(); err != nil {
		log.Panic("Line Bot init failed:", err)
	}
	db.Connect()
	if err := storage.InitStorage(); err != nil {
		log.Fatal("Storage init failed:", err)
	}
	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins:     allowOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))
	r.GET("/hello", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Hello from ToothToday API",
		})
	})
	fmt.Println("Server running on http://localhost:8080")

	//auth
	r.POST("/api/auth/register", handlers.Register)
	r.POST("/api/auth/login", handlers.Login)
	// r.POST("/api/auth/google-login", handlers.GoogleLogin)

	//user (login)
	r.GET("/api/users/me", middleware.AuthMiddleware(), handlers.GetProfile)
	r.PUT("/api/users/me", middleware.AuthMiddleware(), handlers.UpdateProfile)

	// data
	r.GET("/api/users", handlers.GetUsers)
	r.GET("/api/doctors", handlers.GetDoctors)
	r.GET("/api/services", handlers.GetServices)
	r.GET("/api/services-content", handlers.GetServicesContent)
	r.GET("/api/services/:id", handlers.GetServiceByID)

	//appointment
	r.GET("/api/appointment", handlers.GetAppointment)
	r.POST("/api/appointment/book", handlers.CreateAppointment)
	r.DELETE("/api/appointment/:id", middleware.AuthMiddleware(), handlers.DeleteAppointment)
	r.GET("/api/appointment/slots", handlers.GetDoctorSlots)
	r.GET("/api/appointment/booked", handlers.GetBookedSlots)
	r.GET("/api/appointment/availability", handlers.GetMonthAvailability)

	//doctor schedule
	r.GET("/api/appointment/availability/day", handlers.GetDayAvailability)

	//line
	r.GET("/api/line/callback", handlers.LineLoginCallback)
	r.DELETE("/api/line/unlink", middleware.AuthMiddleware(), handlers.UnlinkLineAccount)

	// เริ่ม scheduler
	ctx := context.Background()
	go jobs.ScheduleNotifyJob(ctx, db.Pool)
	go jobs.ScheduleNoShowJob(ctx, db.Pool)
	go jobs.ScheduleCompleteJob(ctx, db.Pool)

	r.Run(":" + port)
	// keep main alive
	select {}

}
