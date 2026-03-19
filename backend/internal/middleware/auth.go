package middleware

import (
	"github.com/gofiber/fiber/v2"
)

// AuthRequired is a placeholder for JWT authentication
func AuthRequired(c *fiber.Ctx) error {
	// For now, it just passes through
	// In a real app, you would verify the JWT token here
	return c.Next()
}
