package main

import (
	"context"
	"log"
	"net/http"

	"arp-backend/internal/auth"
	"arp-backend/internal/config"
	"arp-backend/internal/database"
	"arp-backend/internal/handlers"
)

func main() {
	cfg := config.Load()
	ctx := context.Background()

	if err := database.Migrate(cfg.DatabaseURL); err != nil {
		log.Fatalf("migration failed: %v", err)
	}
	log.Println("migrations applied")

	pool, err := database.Connect(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("could not connect to database: %v", err)
	}
	defer pool.Close()

	authManager := auth.NewManager(cfg.JWTSecret)
	server := handlers.New(pool, authManager, cfg.UploadDir)

	log.Printf("listening on :%s", cfg.Port)
	if err := http.ListenAndServe(":"+cfg.Port, server.Router()); err != nil {
		log.Fatalf("server error: %v", err)
	}
}
