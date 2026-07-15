package middleware

import (
	"go-backend/models" // Replace with your actual module name

	"github.com/gofiber/fiber/v2"
)

// AdminMiddleware mimics the NestJS/Hono AdminGuard logic
func AdminMiddleware(c *fiber.Ctx) error {
	// 1. Retrieve the user from the Fiber context (Locals)
	val := c.Locals("user")
	if val == nil {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"message": "Unauthorized: No user found",
		})
	}

	// 2. Type assertion to your struct
	user, ok := val.(models.AuthenticatedUser)
	if !ok {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Internal error: Auth context failure",
		})
	}

	// 3. Admin Guard Logic
	if !user.IsAdmin {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"message": "Admin resource. Access denied.",
		})
	}

	// 4. Authorized, proceed to the next handler
	return c.Next()
}
