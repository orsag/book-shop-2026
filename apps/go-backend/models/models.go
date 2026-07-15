package models

import (
	"time"
)

type ProductType string

const (
	BOOK      ProductType = "BOOK"
	GAME      ProductType = "GAME"
	GASTRO    ProductType = "GASTRO"
	GIFT_CARD ProductType = "GIFT_CARD"
	TOYS      ProductType = "TOYS"
	CARDS     ProductType = "CARDS"
	PUZZLE    ProductType = "PUZZLE"
)

type Product struct {
	ID                  string      `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	SKU                 string      `gorm:"unique;not null"`
	Name                string      `gorm:"not null"`
	AlternativeHeadline string      `gorm:"not null"`
	Description         string      `gorm:"default:''"`
	Price               float64     `gorm:"default:0"`
	Discount            float64     `gorm:"default:0"`
	AvailableCount      int         `gorm:"default:0"`
	IsAvailable         bool        `gorm:"default:true"`
	ProductQuality      string      `gorm:"default:'new'"`
	CoverUrl            *string     `gorm:"type:text"`
	ProductType         ProductType `gorm:"type:varchar(20)"`

	// Relations
	Rating        *AggregateRating `gorm:"foreignKey:ProductID"`
	OrderItems    []OrderItem      `gorm:"foreignKey:ProductID"`
	BookDetails   *BookDetails     `gorm:"foreignKey:ProductID"`
	GameDetails   *GameDetails     `gorm:"foreignKey:ProductID"`
	GastroDetails *GastroDetails   `gorm:"foreignKey:ProductID"`
	GiftCard      *GiftCard        `gorm:"foreignKey:ProductID"`

	CreatedAt time.Time
	UpdatedAt time.Time
}

type GiftCard struct {
	ID            string `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	ProductID     string `gorm:"unique;not null"`
	Price         int    `gorm:"not null"`
	PriceCurrency string `gorm:"not null"`
}

type BookDetails struct {
	ID            string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	ProductID     string    `gorm:"unique;not null"`
	Author        string    `gorm:"not null"`
	ISBN          string    `gorm:"unique;not null"`
	Publisher     string    `gorm:"not null"`
	PageCount     int       `gorm:"not null"`
	BookFormat    string    `gorm:"not null"`
	Category      string    `gorm:"not null"`
	Binding       string    `gorm:"not null"`
	PublishedDate time.Time `gorm:"not null"`
	AudioBook     bool      `gorm:"not null"`
	AudioLength   int       `gorm:"not null"`
	AudioLanguage *string   `gorm:"type:varchar(10)"`
}

type GameDetails struct {
	ID              string `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	ProductID       string `gorm:"unique;not null"`
	Category        string `gorm:"not null"`
	Brand           string `gorm:"not null"`
	PlayersMin      int    `gorm:"not null"`
	PlayersMax      int    `gorm:"not null"`
	PlayTimeMinutes int    `gorm:"not null"`
	Producer        string `gorm:"not null"`
}

type GastroDetails struct {
	ID        string `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	ProductID string `gorm:"unique;not null"`
	Producer  string `gorm:"not null"`
	Category  string `gorm:"not null"`
	Brand     string `gorm:"not null"`
	Binding   string `gorm:"not null"`
	Edition   int    `gorm:"not null"`
	Weight    int    `gorm:"not null"`
}

type AggregateRating struct {
	ID          string  `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	RatingValue float64 `gorm:"not null"`
	RatingCount int     `gorm:"not null"`
	BestRating  int     `gorm:"not null"`
	WorstRating int     `gorm:"not null"`
	ProductID   string  `gorm:"unique;not null"`
}

type Order struct {
	ID          string      `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	UserID      string      `gorm:"not null"`
	Items       []OrderItem `gorm:"foreignKey:OrderID"`
	TotalAmount float64     `gorm:"not null"`
	Status      string      `gorm:"default:'PENDING'"`
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

type OrderItem struct {
	ID        string  `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	OrderID   string  `gorm:"not null"`
	ProductID string  `gorm:"not null"`
	Quantity  int     `gorm:"not null"`
	Price     float64 `gorm:"not null"`
}

type ImageRecord struct {
	ID        uint   `gorm:"primaryKey;autoIncrement"`
	Filename  string `gorm:"not null"`
	Url       string `gorm:"not null"`
	CreatedAt time.Time
}
