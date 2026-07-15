package handlers

import (
	"go-backend/database"
	"go-backend/models"

	"math/rand"

	"github.com/gofiber/fiber/v2"
)

type FindAllQuery struct {
	Type         string `query:"type"` // e.g., "BOOK"
	Page         int    `query:"page"`
	Limit        int    `query:"limit"`
	IsDiscounted bool   `query:"isDiscounted"`
	Search       string `query:"search"`
	Category     string `query:"category"`
	SortBy       string `query:"sortBy"`
}

// GetProducts handles the GET / route
func GetProducts(c *fiber.Ctx) error {
	// 1. Parse Query Params
	query := new(FindAllQuery)
	if err := c.QueryParser(query); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid query params"})
	}

	// Set defaults
	if query.Page <= 0 {
		query.Page = 1
	}
	if query.Limit <= 0 || query.Limit > 100 {
		query.Limit = 10
	}
	if query.Type == "" {
		query.Type = "BOOK"
	}

	// 2. Build Query
	dbQuery := database.DB.Model(&models.Product{}).Where("product_type = ?", query.Type)

	// Fuzzy Search (Using raw SQL for ILIKE as in your Prisma logic)
	if query.Search != "" {
		dbQuery = dbQuery.Where("name ILIKE ?", "%"+query.Search+"%")
	}

	// Category Filtering (Dynamic)
	if query.Category != "" {
		relation := ""
		switch query.Type {
		case "BOOK":
			relation = "BookDetails"
		case "GAME":
			relation = "GameDetails"
		case "GASTRO":
			relation = "GastroDetails"
		}
		if relation != "" {
			dbQuery = dbQuery.Joins("JOIN "+relation+" ON ...").Where(relation+".category = ?", query.Category)
		}
	}

	// 3. Sorting
	if query.SortBy == "price_asc" {
		dbQuery = dbQuery.Order("price asc")
	}
	if query.SortBy == "price_desc" {
		dbQuery = dbQuery.Order("price desc")
	}

	// 4. Preload dynamic relations
	dbQuery = dbQuery.Preload("Rating")
	switch query.Type {
	case "BOOK":
		dbQuery = dbQuery.Preload("BookDetails")
	case "GAME":
		dbQuery = dbQuery.Preload("GameDetails")
	case "GASTRO":
		dbQuery = dbQuery.Preload("GastroDetails")
	}

	// 5. Paginate and Execute
	var total int64
	dbQuery.Count(&total)

	var products []models.Product
	offset := (query.Page - 1) * query.Limit
	dbQuery.Offset(offset).Limit(query.Limit).Find(&products)

	// 6. Return Response
	return c.JSON(fiber.Map{
		"data": products,
		"meta": fiber.Map{
			"total":    total,
			"page":     query.Page,
			"lastPage": (total + int64(query.Limit) - 1) / int64(query.Limit),
			"hasMore":  int64(offset)+int64(len(products)) < total,
		},
	})
}

func GetProduct(c *fiber.Ctx) error {
	id := c.Params("id")
	productType := c.Query("type", "BOOK") // Default to BOOK if not provided

	// 1. Initialize query
	query := database.DB.Model(&models.Product{})

	// 2. Conditionally Preload relations based on type
	switch productType {
	case "BOOK":
		query = query.Preload("BookDetails")
	case "GAME":
		query = query.Preload("GameDetails")
	case "GASTRO":
		query = query.Preload("GastroDetails")
	case "GIFT_CARD":
		query = query.Preload("CardDetails")
	}

	// Always preload Rating
	query = query.Preload("Rating")

	// 3. Execute Find
	var product models.Product
	if err := query.First(&product, "id = ?", id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Product not found",
		})
	}

	return c.JSON(product)
}

// Helper to generate a unique internal SKU
func generateInternalSku() string {
	const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
	b := make([]byte, 8)
	for i := range b {
		b[i] = chars[rand.Intn(len(chars))]
	}
	return string(b)
}

func CreateProduct(c *fiber.Ctx) error {
	// 1. Parse incoming JSON
	var body struct {
		models.Product
		BookDetails   *models.BookDetails   `json:"bookDetails"`
		GameDetails   *models.GameDetails   `json:"gameDetails"`
		GastroDetails *models.GastroDetails `json:"gastroDetails"`
		CardDetails   *models.GiftCard      `json:"cardDetails"`
	}

	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	// 2. Prepare the Product
	product := body.Product
	product.SKU = generateInternalSku()

	// Create default rating
	product.Rating = &models.AggregateRating{
		RatingValue: 0,
		RatingCount: 0,
		BestRating:  5,
		WorstRating: 1,
	}

	// 3. Assign nested details based on type
	switch product.ProductType {
	case "BOOK":
		product.BookDetails = body.BookDetails
	case "GAME":
		product.GameDetails = body.GameDetails
	case "GASTRO":
		product.GastroDetails = body.GastroDetails
	case "GIFT_CARD":
		product.GiftCard = body.CardDetails
	}

	// 4. Save to DB
	// GORM will automatically create the Product and nested relations in one go
	if err := database.DB.Create(&product).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create product"})
	}

	return c.Status(201).JSON(product)
}
