package database

import (
	"context"
	"encoding/json"
	"fmt"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
)

type seedReview struct {
	ID      int    `json:"id"`
	Author  string `json:"author"`
	Rating  int    `json:"rating"`
	Comment string `json:"comment"`
	Date    string `json:"date"`
}

type seedWorkplace struct {
	ID                 int          `json:"id"`
	Title              string       `json:"title"`
	Description        string       `json:"description"`
	Latitude           float64      `json:"latitude"`
	Longitude          float64      `json:"longitude"`
	Utilities          []string     `json:"utilities"`
	Noise              int          `json:"noise"`
	Images             []string     `json:"images"`
	WorkMode           string       `json:"workMode"`
	Crowdedness        string       `json:"crowdedness"`
	CrowdByHourAverage []string     `json:"crowdByHourAverage"`
	CrowdByHourToday   []string     `json:"crowdByHourToday"`
	Reviews            []seedReview `json:"reviews"`
	PhoneNumber        string       `json:"phoneNumber"`
	Email              string       `json:"email"`
}

type seedFile struct {
	Workplaces []seedWorkplace `json:"workplaces"`
}

// SeedIfEmpty loads the bundled workplaces JSON into the database, but only if the
// workplaces table has no rows yet, so it is safe to call on every startup.
func SeedIfEmpty(ctx context.Context, pool *pgxpool.Pool, seedFilePath string) error {
	return Seed(ctx, pool, seedFilePath, false)
}

// Seed loads the bundled workplaces JSON into the database. If force is true, existing
// workplaces (and their reviews/favourites, via cascade) are wiped first.
func Seed(ctx context.Context, pool *pgxpool.Pool, seedFilePath string, force bool) error {
	var count int
	if err := pool.QueryRow(ctx, `SELECT count(*) FROM workplaces`).Scan(&count); err != nil {
		return fmt.Errorf("check existing workplaces: %w", err)
	}
	if count > 0 {
		if !force {
			return nil
		}
		if _, err := pool.Exec(ctx, `TRUNCATE workplaces RESTART IDENTITY CASCADE`); err != nil {
			return fmt.Errorf("truncate workplaces: %w", err)
		}
	}

	raw, err := os.ReadFile(seedFilePath)
	if err != nil {
		return fmt.Errorf("read seed file: %w", err)
	}

	var data seedFile
	if err := json.Unmarshal(raw, &data); err != nil {
		return fmt.Errorf("parse seed file: %w", err)
	}

	tx, err := pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin seed transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	for _, wp := range data.Workplaces {
		if wp.Utilities == nil {
			wp.Utilities = []string{}
		}
		if wp.Images == nil {
			wp.Images = []string{}
		}
		if wp.WorkMode == "" {
			wp.WorkMode = "both"
		}

		_, err := tx.Exec(ctx, `
			INSERT INTO workplaces (id, title, description, latitude, longitude, utilities, noise, images, work_mode,
			                        crowdedness, crowd_by_hour_average, crowd_by_hour_today, phone_number, email)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
			wp.ID, wp.Title, wp.Description, wp.Latitude, wp.Longitude, wp.Utilities, wp.Noise, wp.Images, wp.WorkMode,
			wp.Crowdedness, wp.CrowdByHourAverage, wp.CrowdByHourToday, wp.PhoneNumber, wp.Email,
		)
		if err != nil {
			return fmt.Errorf("insert workplace %d: %w", wp.ID, err)
		}

		for _, review := range wp.Reviews {
			// Source review IDs only need to be unique per-workplace, so let the DB assign
			// its own globally-unique id rather than reusing the JSON one.
			_, err := tx.Exec(ctx, `
				INSERT INTO reviews (workplace_id, author, rating, comment, created_at)
				VALUES ($1, $2, $3, $4, $5::date)`,
				wp.ID, review.Author, review.Rating, review.Comment, review.Date,
			)
			if err != nil {
				return fmt.Errorf("insert review %d for workplace %d: %w", review.ID, wp.ID, err)
			}
		}
	}

	if _, err := tx.Exec(ctx, `SELECT setval('workplaces_id_seq', (SELECT COALESCE(MAX(id), 0) FROM workplaces))`); err != nil {
		return fmt.Errorf("reset workplaces sequence: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("commit seed transaction: %w", err)
	}

	fmt.Printf("seeded %d workplaces\n", len(data.Workplaces))
	return nil
}
