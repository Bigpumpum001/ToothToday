package db

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

var Pool *pgxpool.Pool

func Connect() {

	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading from env file")
	}

	url := os.Getenv("DATABASE_URL")

	config, err := pgxpool.ParseConfig(url)
	if err != nil {
		log.Fatal("Unable to parse config:", err)
	}
	Pool, err = pgxpool.NewWithConfig(context.Background(), config)
	if err != nil {
		log.Fatal("Unable to connect DB:", err)
	}
	fmt.Println("Connect to Database")
}
