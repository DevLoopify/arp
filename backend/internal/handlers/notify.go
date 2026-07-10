package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"sync"

	"arp-backend/internal/auth"

	"github.com/go-chi/chi/v5"
)

const defaultCheckupMessage = "You've been working here for a while now — mind doing a quick checkup?"

type pendingNotification struct {
	Message string `json:"message"`
	Action  string `json:"action"`
}

var (
	notifyMu      sync.Mutex
	pendingByUser = map[int]pendingNotification{}
)

type triggerNotificationRequest struct {
	Message string `json:"message"`
}

func (s *Server) TriggerNotification(w http.ResponseWriter, r *http.Request) {
	userID, err := strconv.Atoi(chi.URLParam(r, "userId"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid user id")
		return
	}

	var exists bool
	if err := s.DB.QueryRow(r.Context(), `SELECT true FROM users WHERE id = $1`, userID).Scan(&exists); err != nil {
		writeError(w, http.StatusNotFound, "user not found")
		return
	}

	var req triggerNotificationRequest
	_ = json.NewDecoder(r.Body).Decode(&req)
	message := req.Message
	if message == "" {
		message = defaultCheckupMessage
	}

	notifyMu.Lock()
	pendingByUser[userID] = pendingNotification{Message: message, Action: "checkup"}
	notifyMu.Unlock()

	writeJSON(w, http.StatusOK, map[string]string{"status": "queued"})
}

func (s *Server) PollNotifications(w http.ResponseWriter, r *http.Request) {
	userID, _ := auth.UserIDFromContext(r.Context())

	notifyMu.Lock()
	notif, ok := pendingByUser[userID]
	if ok {
		delete(pendingByUser, userID)
	}
	notifyMu.Unlock()

	if !ok {
		writeJSON(w, http.StatusOK, map[string]any{"notification": nil})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"notification": notif})
}
