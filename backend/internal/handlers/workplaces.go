package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"regexp"
	"strconv"

	"arp-backend/internal/auth"
	"arp-backend/internal/models"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
)

type createWorkplaceRequest struct {
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Latitude    float64  `json:"latitude"`
	Longitude   float64  `json:"longitude"`
	Utilities   []string `json:"utilities"`
	Images      []string `json:"images"`
	WorkMode    string   `json:"workMode"`
	OpensAt     *string  `json:"opensAt"`
	ClosesAt    *string  `json:"closesAt"`
}

var validWorkplaceWorkModes = map[string]bool{"solo": true, "group": true, "both": true}

var timeOfDayPattern = regexp.MustCompile(`^([01]\d|2[0-3]):([0-5]\d)$`)

func validTimeOfDay(t *string) bool {
	return t == nil || *t == "" || timeOfDayPattern.MatchString(*t)
}

func normalizeTimeOfDay(t *string) *string {
	if t == nil || *t == "" {
		return nil
	}
	return t
}

func (s *Server) ListWorkplaces(w http.ResponseWriter, r *http.Request) {
	rows, err := s.DB.Query(r.Context(), `
		SELECT id, title, description, latitude, longitude, utilities, noise, images, work_mode,
		       crowdedness, crowd_by_hour_average, crowd_by_hour_today, phone_number, email, opens_at, closes_at, owner_user_id
		FROM workplaces
		ORDER BY id`)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not load workplaces")
		return
	}
	defer rows.Close()

	var workplaces []models.Workplace
	for rows.Next() {
		wp, err := scanWorkplace(rows)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "could not read workplaces")
			return
		}
		workplaces = append(workplaces, wp)
	}

	if err := attachReviews(r.Context(), s.DB, workplaces); err != nil {
		writeError(w, http.StatusInternalServerError, "could not load reviews")
		return
	}

	writeJSON(w, http.StatusOK, workplaces)
}

func (s *Server) GetWorkplace(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid workplace id")
		return
	}

	row := s.DB.QueryRow(r.Context(), `
		SELECT id, title, description, latitude, longitude, utilities, noise, images, work_mode,
		       crowdedness, crowd_by_hour_average, crowd_by_hour_today, phone_number, email, opens_at, closes_at, owner_user_id
		FROM workplaces WHERE id = $1`, id)

	wp, err := scanWorkplace(row)
	if err != nil {
		if err == pgx.ErrNoRows {
			writeError(w, http.StatusNotFound, "workplace not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "could not load workplace")
		return
	}

	workplaces := []models.Workplace{wp}
	if err := attachReviews(r.Context(), s.DB, workplaces); err != nil {
		writeError(w, http.StatusInternalServerError, "could not load reviews")
		return
	}

	writeJSON(w, http.StatusOK, workplaces[0])
}

func (s *Server) CreateWorkplace(w http.ResponseWriter, r *http.Request) {
	userID, _ := auth.UserIDFromContext(r.Context())

	var req createWorkplaceRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.Title == "" {
		writeError(w, http.StatusBadRequest, "title is required")
		return
	}
	if req.Utilities == nil {
		req.Utilities = []string{}
	}
	if req.Images == nil {
		req.Images = []string{}
	}
	if req.WorkMode == "" {
		req.WorkMode = "both"
	}
	if !validWorkplaceWorkModes[req.WorkMode] {
		writeError(w, http.StatusBadRequest, "invalid work mode")
		return
	}
	if !validTimeOfDay(req.OpensAt) || !validTimeOfDay(req.ClosesAt) {
		writeError(w, http.StatusBadRequest, "opening and closing times must be in HH:MM format")
		return
	}

	emptyHours := make([]string, 24)
	for i := range emptyHours {
		emptyHours[i] = "empty"
	}

	var wp models.Workplace
	row := s.DB.QueryRow(r.Context(), `
		INSERT INTO workplaces (title, description, latitude, longitude, utilities, images, work_mode, crowdedness,
		                         crowd_by_hour_average, crowd_by_hour_today, opens_at, closes_at, owner_user_id)
		VALUES ($1, $2, $3, $4, $5, $6, $7, 'empty', $8, $8, $9, $10, $11)
		RETURNING id, title, description, latitude, longitude, utilities, noise, images, work_mode,
		          crowdedness, crowd_by_hour_average, crowd_by_hour_today, phone_number, email, opens_at, closes_at, owner_user_id`,
		req.Title, req.Description, req.Latitude, req.Longitude, req.Utilities, req.Images, req.WorkMode, emptyHours,
		normalizeTimeOfDay(req.OpensAt), normalizeTimeOfDay(req.ClosesAt), userID,
	)

	wp, err := scanWorkplace(row)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not create workplace")
		return
	}
	wp.Reviews = []models.Review{}

	writeJSON(w, http.StatusCreated, wp)
}

func (s *Server) UpdateWorkplace(w http.ResponseWriter, r *http.Request) {
	userID, _ := auth.UserIDFromContext(r.Context())

	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid workplace id")
		return
	}

	var req createWorkplaceRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.Title == "" {
		writeError(w, http.StatusBadRequest, "title is required")
		return
	}
	if req.Utilities == nil {
		req.Utilities = []string{}
	}
	if req.Images == nil {
		req.Images = []string{}
	}
	if req.WorkMode == "" {
		req.WorkMode = "both"
	}
	if !validWorkplaceWorkModes[req.WorkMode] {
		writeError(w, http.StatusBadRequest, "invalid work mode")
		return
	}
	if !validTimeOfDay(req.OpensAt) || !validTimeOfDay(req.ClosesAt) {
		writeError(w, http.StatusBadRequest, "opening and closing times must be in HH:MM format")
		return
	}

	var ownerID *int
	if err := s.DB.QueryRow(r.Context(), `SELECT owner_user_id FROM workplaces WHERE id = $1`, id).Scan(&ownerID); err != nil {
		writeError(w, http.StatusNotFound, "workplace not found")
		return
	}
	if ownerID == nil || *ownerID != userID {
		writeError(w, http.StatusForbidden, "you can only edit workplaces you added")
		return
	}

	row := s.DB.QueryRow(r.Context(), `
		UPDATE workplaces
		SET title = $1, description = $2, latitude = $3, longitude = $4, utilities = $5, images = $6, work_mode = $7,
		    opens_at = $8, closes_at = $9
		WHERE id = $10
		RETURNING id, title, description, latitude, longitude, utilities, noise, images, work_mode,
		          crowdedness, crowd_by_hour_average, crowd_by_hour_today, phone_number, email, opens_at, closes_at, owner_user_id`,
		req.Title, req.Description, req.Latitude, req.Longitude, req.Utilities, req.Images, req.WorkMode,
		normalizeTimeOfDay(req.OpensAt), normalizeTimeOfDay(req.ClosesAt), id,
	)

	wp, err := scanWorkplace(row)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not update workplace")
		return
	}

	workplaces := []models.Workplace{wp}
	if err := attachReviews(r.Context(), s.DB, workplaces); err != nil {
		writeError(w, http.StatusInternalServerError, "could not load reviews")
		return
	}

	writeJSON(w, http.StatusOK, workplaces[0])
}

func (s *Server) DeleteWorkplace(w http.ResponseWriter, r *http.Request) {
	userID, _ := auth.UserIDFromContext(r.Context())

	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid workplace id")
		return
	}

	var ownerID *int
	if err := s.DB.QueryRow(r.Context(), `SELECT owner_user_id FROM workplaces WHERE id = $1`, id).Scan(&ownerID); err != nil {
		writeError(w, http.StatusNotFound, "workplace not found")
		return
	}
	if ownerID == nil || *ownerID != userID {
		writeError(w, http.StatusForbidden, "you can only delete workplaces you added")
		return
	}

	if _, err := s.DB.Exec(r.Context(), `DELETE FROM workplaces WHERE id = $1`, id); err != nil {
		writeError(w, http.StatusInternalServerError, "could not delete workplace")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

type rowScanner interface {
	Scan(dest ...any) error
}

func scanWorkplace(row rowScanner) (models.Workplace, error) {
	var wp models.Workplace
	var ownerUserID *int
	err := row.Scan(
		&wp.ID, &wp.Title, &wp.Description, &wp.Latitude, &wp.Longitude, &wp.Utilities, &wp.Noise, &wp.Images, &wp.WorkMode,
		&wp.Crowdedness, &wp.CrowdByHourAverage, &wp.CrowdByHourToday, &wp.PhoneNumber, &wp.Email, &wp.OpensAt, &wp.ClosesAt, &ownerUserID,
	)
	wp.OwnerUserID = ownerUserID
	return wp, err
}

// attachReviews loads reviews for the given workplaces and fills in Reviews + the computed average Rating.
func attachReviews(ctx context.Context, db pgxQuerier, workplaces []models.Workplace) error {
	if len(workplaces) == 0 {
		return nil
	}

	ids := make([]int, len(workplaces))
	byID := make(map[int]*models.Workplace, len(workplaces))
	for i := range workplaces {
		ids[i] = workplaces[i].ID
		workplaces[i].Reviews = []models.Review{}
		byID[workplaces[i].ID] = &workplaces[i]
	}

	rows, err := db.Query(ctx, `
		SELECT id, workplace_id, user_id, author, rating, comment, to_char(created_at, 'YYYY-MM-DD')
		FROM reviews
		WHERE workplace_id = ANY($1)
		ORDER BY created_at`, ids)
	if err != nil {
		return err
	}
	defer rows.Close()

	ratingSums := make(map[int]int)
	ratingCounts := make(map[int]int)

	for rows.Next() {
		var review models.Review
		var workplaceID int
		if err := rows.Scan(&review.ID, &workplaceID, &review.UserID, &review.Author, &review.Rating, &review.Comment, &review.Date); err != nil {
			return err
		}
		if wp, ok := byID[workplaceID]; ok {
			wp.Reviews = append(wp.Reviews, review)
			ratingSums[workplaceID] += review.Rating
			ratingCounts[workplaceID]++
		}
	}

	for id, wp := range byID {
		if count := ratingCounts[id]; count > 0 {
			avg := float64(ratingSums[id]) / float64(count)
			wp.Rating = float64(int(avg*10+0.5)) / 10
		}
	}

	return nil
}

type pgxQuerier interface {
	Query(ctx context.Context, sql string, args ...any) (pgx.Rows, error)
}
