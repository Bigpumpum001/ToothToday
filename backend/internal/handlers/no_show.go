package handlers

import (
	"fmt"
	"log"
	"time"
	"toothtoday/internal/db"
	"toothtoday/internal/handlers/jobs"

	"github.com/gin-gonic/gin"
)

func NotifyUpcomingAppointments(c *gin.Context) {
	now := time.Now().In(db.Loc)
	fmt.Printf("[NotifyJob] Running NotifyUpcomingAppointments at %v\n", now)
	if err := jobs.NotifyUpcomingAppointments(c, db.Pool); err != nil {
		log.Println("Error notify:", err)
	} else {
		fmt.Printf("[NotifyJob] Completed NotifyUpcomingAppointments at %v\n", time.Now().In(db.Loc))
	}
}
func MarkCompleted(c *gin.Context) {
	now := time.Now().In(db.Loc)
	fmt.Printf("[CompletedJob] Running MarkCompleted at %v\n", now)
	if err := jobs.MarkCompleted(c, db.Pool); err != nil {
		log.Println("Error marking complete:", err)
	} else {
		fmt.Printf("[CompletedJob] Completed MarkCompleted at %v\n", time.Now().In(db.Loc))
	}
}

func MarkNoShow(c *gin.Context) {
	now := time.Now().In(db.Loc)
	fmt.Printf("[NoShowJob] Running MarkNoShow at %v\n", now)
	if err := jobs.MarkNoShow(c, db.Pool); err != nil {
		log.Println("Error marking no show:", err)
	} else {
		fmt.Printf("[NoShowJob] Completed MarkNoShow at %v\n", time.Now().In(db.Loc))
	}
}
