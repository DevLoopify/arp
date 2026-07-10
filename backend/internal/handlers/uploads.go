package handlers

import (
	"crypto/rand"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

const maxUploadSize = 10 << 20 // sind 10 mega byte

var allowedImageExts = map[string]bool{
	".jpg": true, ".jpeg": true, ".png": true, ".webp": true, ".heic": true,
}

func (s *Server) UploadImage(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, maxUploadSize)
	if err := r.ParseMultipartForm(maxUploadSize); err != nil {
		writeError(w, http.StatusBadRequest, "file too large or invalid form")
		return
	}

	file, header, err := r.FormFile("image")
	if err != nil {
		writeError(w, http.StatusBadRequest, "missing \"image\" file field")
		return
	}
	defer file.Close()

	ext := strings.ToLower(filepath.Ext(header.Filename))
	if !allowedImageExts[ext] {
		writeError(w, http.StatusBadRequest, "unsupported image type")
		return
	}

	if err := os.MkdirAll(s.UploadDir, 0o755); err != nil {
		writeError(w, http.StatusInternalServerError, "could not prepare upload directory")
		return
	}

	filename := randomFilename() + ext
	destPath := filepath.Join(s.UploadDir, filename)

	dest, err := os.Create(destPath)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not save file")
		return
	}
	defer dest.Close()

	if _, err := io.Copy(dest, file); err != nil {
		writeError(w, http.StatusInternalServerError, "could not save file")
		return
	}

	writeJSON(w, http.StatusCreated, map[string]string{"url": "/uploads/" + filename})
}

func randomFilename() string {
	buf := make([]byte, 16)
	_, _ = rand.Read(buf)
	return fmt.Sprintf("%x", buf)
}
