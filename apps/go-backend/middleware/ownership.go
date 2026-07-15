package middleware

import (
	"go-backend/models"

	"github.com/gofiber/fiber/v2"
)

// UserOwnershipMiddleware checks if the user is accessing their own data or is an admin
func UserOwnershipMiddleware(c *fiber.Ctx) error {
	// 1. Get the authenticated user from the context
	// (Assuming you set this in your JWT/Auth middleware)
	user := c.Locals("user") // "user" should be an object/struct containing userId and isAdmin

	if user == nil {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"message": "Unauthorized"})
	}

	// Cast the local user to your internal struct
	// Assuming you have an AuthenticatedUser struct defined in your models/types
	authUser := user.(models.AuthenticatedUser)

	// 2. Get the target userId from the route parameter (:userId)
	targetUserId := c.Params("userId")

	// 3. If no targetUserId is in the route, just proceed
	if targetUserId == "" {
		return c.Next()
	}

	// 4. Permission Check: Match ID or allow if Admin
	if authUser.UserID != targetUserId && !authUser.IsAdmin {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"message": "You can only access your own data.",
		})
	}

	return c.Next()
}
