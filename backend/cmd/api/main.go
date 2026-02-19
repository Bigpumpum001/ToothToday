package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"
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
	//db
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
	// doctors for admin
	r.POST("/api/doctors", middleware.AuthMiddleware(), handlers.CreateDoctor)
	r.PUT("/api/doctors/:id", middleware.AuthMiddleware(), handlers.UpdateDoctor)
	r.POST("/api/doctors/:id/delete", middleware.AuthMiddleware(), handlers.DeleteDoctor)
	r.GET("/api/doctors/schedules", middleware.AuthMiddleware(), handlers.GetDoctorSchedules)
	r.POST("/api/doctors/schedules", middleware.AuthMiddleware(), handlers.CreateDoctorSchedules)
	r.PUT("/api/doctors/schedules/:id", middleware.AuthMiddleware(), handlers.UpdateDoctorSchedule)
	r.POST("/api/doctors/schedules/:id/delete", middleware.AuthMiddleware(), handlers.DeleteDoctorSchedule)

	//service
	// r.GET("/api/services", handlers.GetServices)
	// r.GET("/api/services-content", handlers.GetServicesContent)
	r.GET("/api/services-with-content", handlers.GetServicesWithContent)
	r.GET("/api/services/:id", handlers.GetServiceByID)
	//service for admin
	r.POST("/api/services-content", middleware.AuthMiddleware(), handlers.CreateServiceContent)
	r.PUT("/api/services-content/:id", middleware.AuthMiddleware(), handlers.UpdateServiceContent)
	r.POST("/api/services/:id/delete", middleware.AuthMiddleware(), handlers.DeleteServiceContent)

	//appointment
	r.GET("/api/appointment", handlers.GetAppointment)
	r.POST("/api/appointment/book", handlers.CreateAppointment)
	r.DELETE("/api/appointment/:id/delete", middleware.AuthMiddleware(), handlers.DeleteAppointment) //SOFT ใช้ POST
	r.GET("/api/appointment/slots", handlers.GetDoctorSlots)
	r.GET("/api/appointment/booked", handlers.GetBookedSlots)
	r.GET("/api/appointment/availability", handlers.GetMonthAvailability)
	r.GET("/api/appointment/availability/day", handlers.GetDayAvailability)

	// appointment for admin
	r.GET("/api/appointments", middleware.AuthMiddleware(), handlers.GetAppointmentsForAdmin)
	r.PUT("/api/appointments/:id", middleware.AuthMiddleware(), handlers.UpdateAppointmentStatus)
	r.DELETE("/api/appointments/:id/delete", middleware.AuthMiddleware(), handlers.DeleteAppointmentForAdmin) //SOFT ใช้ POST
	// r.DELETE("/api/appointment/:id", middleware.AuthMiddleware(), handlers.DeleteAppointmentByIDForAdmin) //admin
	r.GET("/api/appointment/slot/day", middleware.AuthMiddleware(), handlers.GetAppointmentForAdmin) //admin

	//line
	r.GET("/api/line/callback", handlers.LineLoginCallback)
	r.DELETE("/api/line/unlink", middleware.AuthMiddleware(), handlers.UnlinkLineAccount)

	// เริ่ม scheduler
	ctx := context.Background()
	//cronjob
	r.POST("/cron/notify", handlers.NotifyUpcomingAppointments)
	r.POST("/cron/complete", handlers.MarkCompleted)
	r.POST("/cron/noshow", handlers.MarkNoShow)

	if os.Getenv("GO_ENV") != "production" {
		go jobs.ScheduleNotifyJob(ctx, db.Pool)
		go jobs.ScheduleNoShowJob(ctx, db.Pool)
		go jobs.ScheduleCompleteJob(ctx, db.Pool)
		// keep main alive

	} else if os.Getenv("GO_ENV") == "production" {
		jobType := os.Getenv("JOB_TYPE")
		now := time.Now().In(db.Loc)
		switch jobType {
		case "notify":
			fmt.Printf("[NotifyJob] Running NotifyUpcomingAppointments at %v\n", now)
			if err := jobs.NotifyUpcomingAppointments(ctx, db.Pool); err != nil {
				log.Println("Error notify:", err)
			} else {
				fmt.Printf("[NotifyJob] Completed NotifyUpcomingAppointments at %v\n", time.Now().In(db.Loc))
			}
		case "complete":
			fmt.Printf("[CompletedJob] Running MarkCompleted at %v\n", now)
			if err := jobs.MarkCompleted(ctx, db.Pool); err != nil {
				log.Println("Error marking complete:", err)
			} else {
				fmt.Printf("[CompletedJob] Completed MarkCompleted at %v\n", time.Now().In(db.Loc))
			}
		case "noshow":
			fmt.Printf("[NoShowJob] Running MarkNoShow at %v\n", now)
			if err := jobs.MarkNoShow(ctx, db.Pool); err != nil {
				log.Println("Error marking no show:", err)
			} else {
				fmt.Printf("[NoShowJob] Completed MarkNoShow at %v\n", time.Now().In(db.Loc))
			}
		default:
			fmt.Println("Unknown job type")
		}
	}

	r.Run(":" + port)
	select {}
}
