package middleware

import (
	"os"
	"strings"

	"go-backend/models" // Replace with your actual module name

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

func JwtAuthMiddleware(c *fiber.Ctx) error {
	// 1. Get Authorization Header
	authHeader := c.Get("Authorization")
	if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "Unauthorized: Missing token"})
	}

	tokenString := strings.Split(authHeader, " ")[1]
	secret := os.Getenv("JWT_SECRET")

	// 2. Parse and Verify Token
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})

	if err != nil || !token.Valid {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "Unauthorized: Invalid token"})
	}

	// 3. Extract Claims (Payload)
	claims := token.Claims.(jwt.MapClaims)

	// Construct the authenticated user (Mapping JWT claims to your model)
	// Note: We use type assertions because claims are generic maps
	authUser := models.AuthenticatedUser{
		UserID:   claims["sub"].(string),
		Username: claims["username"].(string),
		IsAdmin:  claims["isAdmin"].(bool),
	}

	// 4. Attach to context (Locals)
	c.Locals("user", authUser)

	return c.Next()
}
