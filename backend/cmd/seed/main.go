// Command seed (re)populates the database from the bundled workplaces JSON file.
// Run with -force to wipe existing workplaces/reviews/favourites first.
package main

import (
	"context"
	"flag"
	"log"

	"arp-backend/internal/config"
	"arp-backend/internal/database"
)

func main() {
	force := flag.Bool("force", false, "wipe existing workplaces before seeding")
	flag.Parse()

	cfg := config.Load()
	ctx := context.Background()

	if err := database.Migrate(cfg.DatabaseURL); err != nil {
		log.Fatalf("migration failed: %v", err)
	}

	pool, err := database.Connect(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("could not connect to database: %v", err)
	}
	defer pool.Close()

	if err := database.Seed(ctx, pool, cfg.SeedFile, *force); err != nil {
		log.Fatalf("seed failed: %v", err)
	}

	log.Println("seed complete")
}
