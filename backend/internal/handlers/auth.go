package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"arp-backend/internal/auth"
	"arp-backend/internal/models"

	"github.com/jackc/pgx/v5"
)

type registerRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type authResponse struct {
	Token string      `json:"token"`
	User  models.User `json:"user"`
}

func (s *Server) Register(w http.ResponseWriter, r *http.Request) {
	var req registerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	req.Name = strings.TrimSpace(req.Name)
	req.Email = strings.TrimSpace(strings.ToLower(req.Email))

	if req.Name == "" || req.Email == "" || len(req.Password) < 8 {
		writeError(w, http.StatusBadRequest, "name, email and a password of at least 8 characters are required")
		return
	}

	passwordHash, err := auth.HashPassword(req.Password)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not process password")
		return
	}

	var user models.User
	err = s.DB.QueryRow(r.Context(),
		`INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3)
		 RETURNING id, name, email, avatar_url, noise_level, radius, work_mode, utilities, distance_unit, language, created_at`,
		req.Name, req.Email, passwordHash,
	).Scan(
		&user.ID, &user.Name, &user.Email, &user.AvatarURL, &user.NoiseLevel, &user.Radius,
		&user.WorkMode, &user.Utilities, &user.DistanceUnit, &user.Language, &user.CreatedAt,
	)
	if err != nil {
		if isUniqueViolation(err) {
			writeError(w, http.StatusConflict, "an account with this email already exists")
			return
		}
		writeError(w, http.StatusInternalServerError, "could not create account")
		return
	}

	token, err := s.Auth.IssueToken(user.ID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not issue token")
		return
	}

	writeJSON(w, http.StatusCreated, authResponse{Token: token, User: user})
}

func (s *Server) Login(w http.ResponseWriter, r *http.Request) {
	var req loginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	req.Email = strings.TrimSpace(strings.ToLower(req.Email))

	var user models.User
	var passwordHash string
	err := s.DB.QueryRow(r.Context(),
		`SELECT id, name, email, password_hash, avatar_url, noise_level, radius, work_mode, utilities, distance_unit, language, created_at
		 FROM users WHERE email = $1`,
		req.Email,
	).Scan(
		&user.ID, &user.Name, &user.Email, &passwordHash, &user.AvatarURL, &user.NoiseLevel, &user.Radius,
		&user.WorkMode, &user.Utilities, &user.DistanceUnit, &user.Language, &user.CreatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			writeError(w, http.StatusUnauthorized, "invalid email or password")
			return
		}
		writeError(w, http.StatusInternalServerError, "could not log in")
		return
	}

	if !auth.CheckPassword(passwordHash, req.Password) {
		writeError(w, http.StatusUnauthorized, "invalid email or password")
		return
	}

	token, err := s.Auth.IssueToken(user.ID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not issue token")
		return
	}

	writeJSON(w, http.StatusOK, authResponse{Token: token, User: user})
}

func (s *Server) Me(w http.ResponseWriter, r *http.Request) {
	userID, _ := auth.UserIDFromContext(r.Context())

	var user models.User
	err := s.DB.QueryRow(r.Context(),
		`SELECT id, name, email, avatar_url, noise_level, radius, work_mode, utilities, distance_unit, language, created_at
		 FROM users WHERE id = $1`,
		userID,
	).Scan(
		&user.ID, &user.Name, &user.Email, &user.AvatarURL, &user.NoiseLevel, &user.Radius,
		&user.WorkMode, &user.Utilities, &user.DistanceUnit, &user.Language, &user.CreatedAt,
	)
	if err != nil {
		writeError(w, http.StatusNotFound, "user not found")
		return
	}

	writeJSON(w, http.StatusOK, user)
}

type updateProfileRequest struct {
	Name       string   `json:"name"`
	AvatarURL  string   `json:"avatarUrl"`
	NoiseLevel int      `json:"noiseLevel"`
	Radius     int      `json:"radius"`
	WorkMode   string   `json:"workMode"`
	Utilities  []string `json:"utilities"`
	Unit       string   `json:"unit"`
	Language   string   `json:"language"`
}

var validWorkModes = map[string]bool{"solo": true, "group": true}
var validUnits = map[string]bool{"km": true, "mi": true}
var validLanguages = map[string]bool{"en": true, "de": true}

func (s *Server) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	userID, _ := auth.UserIDFromContext(r.Context())

	var req updateProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	req.Name = strings.TrimSpace(req.Name)

	if req.Name == "" {
		writeError(w, http.StatusBadRequest, "name is required")
		return
	}
	if req.NoiseLevel < 1 || req.NoiseLevel > 5 {
		writeError(w, http.StatusBadRequest, "noise level must be between 1 and 5")
		return
	}
	if !validWorkModes[req.WorkMode] {
		writeError(w, http.StatusBadRequest, "invalid work mode")
		return
	}
	if !validUnits[req.Unit] {
		writeError(w, http.StatusBadRequest, "invalid distance unit")
		return
	}
	if !validLanguages[req.Language] {
		writeError(w, http.StatusBadRequest, "invalid language")
		return
	}
	if req.Radius < 100 || req.Radius > 5000 {
		writeError(w, http.StatusBadRequest, "radius must be between 100 and 5000")
		return
	}
	if req.Utilities == nil {
		req.Utilities = []string{}
	}

	var user models.User
	err := s.DB.QueryRow(r.Context(),
		`UPDATE users
		 SET name = $1, avatar_url = $2, noise_level = $3, radius = $4, work_mode = $5, utilities = $6, distance_unit = $7, language = $8
		 WHERE id = $9
		 RETURNING id, name, email, avatar_url, noise_level, radius, work_mode, utilities, distance_unit, language, created_at`,
		req.Name, req.AvatarURL, req.NoiseLevel, req.Radius, req.WorkMode, req.Utilities, req.Unit, req.Language, userID,
	).Scan(
		&user.ID, &user.Name, &user.Email, &user.AvatarURL, &user.NoiseLevel, &user.Radius,
		&user.WorkMode, &user.Utilities, &user.DistanceUnit, &user.Language, &user.CreatedAt,
	)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not update profile")
		return
	}

	writeJSON(w, http.StatusOK, user)
}

func isUniqueViolation(err error) bool {
	return strings.Contains(err.Error(), "unique constraint")
}
