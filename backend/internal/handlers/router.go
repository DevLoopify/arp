package handlers

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func (s *Server) Router() http.Handler {
	r := chi.NewRouter()

	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowCredentials: false,
	}))

	r.Get("/api/health", s.Health)

	r.Route("/api/auth", func(r chi.Router) {
		r.Post("/register", s.Register)
		r.Post("/login", s.Login)
		r.With(s.Auth.Middleware).Get("/me", s.Me)
	})

	r.Route("/api/workplaces", func(r chi.Router) {
		r.Get("/", s.ListWorkplaces)
		r.Get("/{id}", s.GetWorkplace)
		r.With(s.Auth.Middleware).Post("/", s.CreateWorkplace)
		r.With(s.Auth.Middleware).Post("/{id}/reviews", s.CreateReview)
	})

	r.Route("/api/favourites", func(r chi.Router) {
		r.Use(s.Auth.Middleware)
		r.Get("/", s.ListFavourites)
		r.Post("/{id}", s.AddFavourite)
		r.Delete("/{id}", s.RemoveFavourite)
	})

	r.With(s.Auth.Middleware).Post("/api/uploads", s.UploadImage)

	fileServer := http.FileServer(http.Dir(s.UploadDir))
	r.Handle("/uploads/*", http.StripPrefix("/uploads/", fileServer))

	return r
}
