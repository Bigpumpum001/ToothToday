package handlers

import (
	"fmt"
	"log"
	"time"
	"toothtoday/internal/db"
	"toothtoday/internal/services"

	"github.com/gin-gonic/gin"
)

func NotifyUpcomingAppointments(c *gin.Context) {
	now := time.Now().In(db.Loc)
	fmt.Printf("[NotifyJob] Running NotifyUpcomingAppointments at %v\n", now)
	if err := services.NotifyUpcomingAppointments(c, db.Pool); err != nil {
		log.Println("Error notify:", err)
		c.Status(500)
		return
	} else {
		fmt.Printf("[NotifyJob] Completed NotifyUpcomingAppointments at %v\n", time.Now().In(db.Loc))
	}
	c.Status(204)

}
func MarkCompleted(c *gin.Context) {
	now := time.Now().In(db.Loc)
	fmt.Printf("[CompletedJob] Running MarkCompleted at %v\n", now)
	if err := services.MarkCompleted(c, db.Pool); err != nil {
		log.Println("Error marking complete:", err)
		c.Status(500)
		return
	} else {
		fmt.Printf("[CompletedJob] Completed MarkCompleted at %v\n", time.Now().In(db.Loc))
	}
	c.Status(204)

}

func MarkNoShow(c *gin.Context) {
	now := time.Now().In(db.Loc)
	fmt.Printf("[NoShowJob] Running MarkNoShow at %v\n", now)
	if err := services.MarkNoShow(c, db.Pool); err != nil {
		log.Println("Error marking no show:", err)
		c.Status(500)
		return
	} else {
		fmt.Printf("[NoShowJob] Completed MarkNoShow at %v\n", time.Now().In(db.Loc))
	}
	c.Status(204)
}
