package handlers

import (
	"encoding/json"
	"net/http"

	"arp-backend/internal/auth"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Server struct {
	DB        *pgxpool.Pool
	Auth      *auth.Manager
	UploadDir string
}

func New(db *pgxpool.Pool, authManager *auth.Manager, uploadDir string) *Server {
	return &Server{DB: db, Auth: authManager, UploadDir: uploadDir}
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"error": message})
}
