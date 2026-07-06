package models

import "time"

type User struct {
	ID        int       `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	CreatedAt time.Time `json:"createdAt"`
}

type Review struct {
	ID      int    `json:"id"`
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
	Rating             float64  `json:"rating"`
	Crowdedness        string   `json:"crowdedness"`
	CrowdByHourAverage []string `json:"crowdByHourAverage"`
	CrowdByHourToday   []string `json:"crowdByHourToday"`
	PhoneNumber        string   `json:"phoneNumber"`
	Email              string   `json:"email"`
	OwnerUserID        *int     `json:"ownerUserId,omitempty"`
	Reviews            []Review `json:"reviews"`
}
