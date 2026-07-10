package config

import "os"

type Config struct {
	Port        string
	DatabaseURL string
	JWTSecret   string
	UploadDir   string
	SeedFile    string
}

func Load() Config {
	return Config{
		Port:        getEnv("PORT", "8080"),
		DatabaseURL: getEnv("DATABASE_URL", "postgres://arp:arp@localhost:5432/arp?sslmode=disable"),
		JWTSecret:   getEnv("JWT_SECRET", "blah-blah"),
		UploadDir:   getEnv("UPLOAD_DIR", "./uploads"),
		SeedFile:    getEnv("SEED_FILE", "./data/worplaces.json"),
	}
}

func getEnv(key, fallback string) string {
	if v, ok := os.LookupEnv(key); ok && v != "" {
		return v
	}
	return fallback
}
