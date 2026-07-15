package main

import (
	"log"
	"os"

	"go-backend/database"
	"go-backend/handlers"
	"go-backend/middleware"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq" // Driver registration
)

func main() {
	// 1. Load environment variables
	err := godotenv.Load("../../.env")
	if err != nil {
		log.Println("No .env file found, relying on system env vars")
	}

	// 2. Initialize Database Connection
	database.ConnectDB()

	// 3. Initialize Fiber App
	app := fiber.New(fiber.Config{
		AppName: "My Go API",
	})

	// Add middleware
	app.Use(logger.New())

	// 4. Define Routes
	productGroup := app.Group("/products")

	productGroup.Get("/", handlers.GetProducts)
	productGroup.Get("/:id", handlers.GetProduct)
	productGroup.Post("/", middleware.JwtAuthMiddleware, middleware.AdminMiddleware, handlers.CreateProduct)

	// 5. Start Server
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	log.Fatal(app.Listen(":" + port))
}
