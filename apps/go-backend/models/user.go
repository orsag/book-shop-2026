package models

import (
	"time"

	"github.com/lib/pq"
)

type User struct {
	ID          string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Email       string    `gorm:"unique;not null"`
	Username    string    `gorm:"unique;not null"`
	IsAdmin     bool      `gorm:"default:false"`
	PhoneNumber string    `gorm:"default:''"`
	Theme       string    `gorm:"default:'light'"`
	LastLogin   time.Time `gorm:"default:now()"`
	AvatarUrl   string    `gorm:"default:''"`
	CreatedAt   time.Time
	UpdatedAt   time.Time
	// Relationships
	Orders     []Order
	Favorites  pq.StringArray `gorm:"type:text[]"`
	CartItems  pq.StringArray `gorm:"type:text[]"`
	UserDetail *UserDetail    `gorm:"foreignKey:UserID"`
}

type UserDetail struct {
	ID                string `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	UserID            string `gorm:"unique;not null"`
	DisplayName       *string
	AvatarUrl         *string
	Bio               *string `gorm:"type:varchar(255)"`
	PreferredLanguage string  `gorm:"default:'en'"`
	// ... (add other fields here)
	CreatedAt time.Time
	UpdatedAt time.Time
	User      User `gorm:"foreignKey:UserID"`
}

type AuthenticatedUser struct {
	UserID   string // Capitalized
	Username string // Capitalized
	IsAdmin  bool   // Capitalized
}
