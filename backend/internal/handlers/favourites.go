package handlers

import (
	"net/http"
	"strconv"

	"arp-backend/internal/auth"

	"github.com/go-chi/chi/v5"
)

func (s *Server) ListFavourites(w http.ResponseWriter, r *http.Request) {
	userID, _ := auth.UserIDFromContext(r.Context())

	rows, err := s.DB.Query(r.Context(), `SELECT workplace_id FROM favourites WHERE user_id = $1 ORDER BY workplace_id`, userID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not load favourites")
		return
	}
	defer rows.Close()

	ids := []int{}
	for rows.Next() {
		var id int
		if err := rows.Scan(&id); err != nil {
			writeError(w, http.StatusInternalServerError, "could not read favourites")
			return
		}
		ids = append(ids, id)
	}

	writeJSON(w, http.StatusOK, ids)
}

func (s *Server) AddFavourite(w http.ResponseWriter, r *http.Request) {
	userID, _ := auth.UserIDFromContext(r.Context())
	workplaceID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid workplace id")
		return
	}

	_, err = s.DB.Exec(r.Context(), `
		INSERT INTO favourites (user_id, workplace_id) VALUES ($1, $2)
		ON CONFLICT (user_id, workplace_id) DO NOTHING`, userID, workplaceID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not add favourite; does the workplace exist?")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) RemoveFavourite(w http.ResponseWriter, r *http.Request) {
	userID, _ := auth.UserIDFromContext(r.Context())
	workplaceID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid workplace id")
		return
	}

	_, err = s.DB.Exec(r.Context(), `DELETE FROM favourites WHERE user_id = $1 AND workplace_id = $2`, userID, workplaceID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not remove favourite")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
