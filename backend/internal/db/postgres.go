package db

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

var Pool *pgxpool.Pool
var Loc *time.Location

func Connect() {
	var err error
	Loc = time.FixedZone("Bangkok", 7*3600)
	url := os.Getenv("DATABASE_URL")
	if url == "" {
		log.Fatal("DATABASE_URL ไม่ถูกตั้งค่า")
	}

	config, err := pgxpool.ParseConfig(url)
	if err != nil {
		log.Fatal("Unable to parse config:", err)
	}
	Pool, err = pgxpool.NewWithConfig(context.Background(), config)
	if err != nil {
		log.Fatal("Unable to connect DB:", err)
	}
	_, err = Pool.Exec(context.Background(), "SET TIME ZONE 'Asia/Bangkok';")
	if err != nil {
		log.Fatal("Unable to set timezone:", err)
	}
	fmt.Println("Connect to Database")
}
