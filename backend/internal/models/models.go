package models

import "time"

type User struct {
	ID           int       `json:"id"`
	Name         string    `json:"name"`
	Email        string    `json:"email"`
	AvatarURL    string    `json:"avatarUrl"`
	NoiseLevel   int       `json:"noiseLevel"`
	Radius       int       `json:"radius"`
	WorkMode     string    `json:"workMode"`
	Utilities    []string  `json:"utilities"`
	DistanceUnit string    `json:"unit"`
	Language     string    `json:"language"`
	CreatedAt    time.Time `json:"createdAt"`
}

type Review struct {
	ID      int    `json:"id"`
	UserID  *int   `json:"userId,omitempty"`
	Author  string `json:"author"`
	Rating  int    `json:"rating"`
	Comment string `json:"comment"`
	Date    string `json:"date"`
}

type Workplace struct {
	ID                 int      `json:"id"`
	Title              string   `json:"title"`
	Description        string   `json:"description"`
	Latitude           float64  `json:"latitude"`
	Longitude          float64  `json:"longitude"`
	Utilities          []string `json:"utilities"`
	Noise              int      `json:"noise"`
	Images             []string `json:"images"`
	WorkMode           string   `json:"workMode"`
	Rating             float64  `json:"rating"`
	Crowdedness        string   `json:"crowdedness"`
	CrowdByHourAverage []string `json:"crowdByHourAverage"`
	CrowdByHourToday   []string `json:"crowdByHourToday"`
	PhoneNumber        string   `json:"phoneNumber"`
	Email              string   `json:"email"`
	OpensAt            *string  `json:"opensAt,omitempty"`
	ClosesAt           *string  `json:"closesAt,omitempty"`
	OwnerUserID        *int     `json:"ownerUserId,omitempty"`
	Reviews            []Review `json:"reviews"`
}
