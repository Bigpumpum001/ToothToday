package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"toothtoday/internal/db"
	"toothtoday/internal/handlers"
	"toothtoday/internal/handlers/jobs"
	"toothtoday/internal/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/line/line-bot-sdk-go/v7/linebot"
)

func main() {
	lineChannelSecret := os.Getenv("LINE_CHANNEL_SECRET")
	lineChannelAccessToken := os.Getenv("LINE_CHANNEL_ACCESS_TOKEN")
	bot, err := linebot.New(
		lineChannelSecret,
		lineChannelAccessToken,
	)
	if err != nil {
		panic(err)
	}
	db.Connect()
	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"}, // frontend origin
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"}, // ✅ ต้องมี Authorization
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
	r.GET("/api/appointment/slots", handlers.GetDoctorSlots)
	r.GET("/api/appointment/booked", handlers.GetBookedSlots)
	r.GET("/api/appointment/availability", handlers.GetMonthAvailability)

	//doctor schedule
	r.GET("/api/appointment/availability/day", handlers.GetDayAvailability)

	//line
	r.POST("/line/webhook", func(c *gin.Context) {
		events, err := bot.ParseRequest(c.Request)
		if err != nil {

			fmt.Println("Error parsing request:", err)
			c.Status(http.StatusOK) // ให้ LINE ไม่ resend
			return
			// if err == linebot.ErrInvalidSignature {
			// 	c.Status(http.StatusBadRequest)
			// } else {
			// 	c.Status(http.StatusInternalServerError)
			// }
			// return
		}
		for _, event := range events {
			fmt.Println("Event type:", event.Type)
			fmt.Println("UserID:", event.Source.UserID)
			if msg, ok := event.Message.(*linebot.TextMessage); ok {
				fmt.Println("Message text:", msg.Text)
			}
			if event.Type == linebot.EventTypeMessage {
				userID := "Uca5abc2a10bf96d078a853d17924b597"
				bot.PushMessage(userID, linebot.NewTextMessage("สวัสดี! คุณจองคิวเรียบร้อยแล้ว")).Do()
				// switch message := event.Message.(type) {
				// case *linebot.TextMessage:
				// 	// ตอบกลับข้อความอัตโนมัติ
				// 	bot.ReplyMessage(event.ReplyToken,
				// 		linebot.NewTextMessage("คุณส่งข้อความ: "+message.Text)).Do()
				// }
			}
		}
		c.Status(http.StatusOK)

	})
	// ตัวอย่างส่งข้อความ push
	r.GET("/send-test", func(c *gin.Context) {
		userID := "USER_LINE_ID" // ใส่ userId ของผู้ใช้ LINE
		_, err := bot.PushMessage(userID,
			linebot.NewTextMessage("สวัสดี! คุณจองคิวเรียบร้อยแล้ว")).Do()
		if err != nil {
			fmt.Println("ส่งข้อความไม่สำเร็จ:", err)
		}
		c.String(200, "ส่งข้อความแล้ว")
	})
	// เริ่ม scheduler
	ctx := context.Background()
	go jobs.ScheduleNoShowJob(ctx, db.Pool)
	go jobs.ScheduleCompleteJob(ctx, db.Pool)

	r.Run(":8080")
	select {}

	// keep main alive
}
