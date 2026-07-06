package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"arp-backend/internal/auth"
	"arp-backend/internal/models"

	"github.com/go-chi/chi/v5"
)

type createReviewRequest struct {
	Rating  int    `json:"rating"`
	Comment string `json:"comment"`
}

func (s *Server) CreateReview(w http.ResponseWriter, r *http.Request) {
	userID, _ := auth.UserIDFromContext(r.Context())

	workplaceID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid workplace id")
		return
	}

	var req createReviewRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.Rating < 1 || req.Rating > 5 {
		writeError(w, http.StatusBadRequest, "rating must be between 1 and 5")
		return
	}

	var authorName string
	if err := s.DB.QueryRow(r.Context(), `SELECT name FROM users WHERE id = $1`, userID).Scan(&authorName); err != nil {
		writeError(w, http.StatusUnauthorized, "user not found")
		return
	}

	var review models.Review
	err = s.DB.QueryRow(r.Context(), `
		INSERT INTO reviews (workplace_id, user_id, author, rating, comment)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, author, rating, comment, to_char(created_at, 'YYYY-MM-DD')`,
		workplaceID, userID, authorName, req.Rating, req.Comment,
	).Scan(&review.ID, &review.Author, &review.Rating, &review.Comment, &review.Date)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not create review; does the workplace exist?")
		return
	}

	writeJSON(w, http.StatusCreated, review)
}
