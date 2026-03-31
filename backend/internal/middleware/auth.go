package middleware

import (
	"strings"

	"github.com/Oladelesunkanmi/payroll-system/backend/internal/models"
	"github.com/Oladelesunkanmi/payroll-system/backend/pkg/database"
	"github.com/Oladelesunkanmi/payroll-system/backend/pkg/utils"
	"github.com/gofiber/fiber/v2"
)

// AuthRequired verifies the JWT token
func AuthRequired(c *fiber.Ctx) error {
	authHeader := c.Get("Authorization")
	if authHeader == "" {
		return c.Status(401).JSON(fiber.Map{"message": "Missing authorization header"})
	}

	tokenParts := strings.Split(authHeader, " ")
	if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
		return c.Status(401).JSON(fiber.Map{"message": "Invalid authorization header format"})
	}

	tokenStr := tokenParts[1]
	userID, err := utils.ParseToken(tokenStr)
	if err != nil {
		return c.Status(401).JSON(fiber.Map{"message": "Invalid or expired token"})
	}

	// Store user ID in locals for further use
	c.Locals("user_id", userID)

	return c.Next()
}

// AdminOnly ensures the user has administrative privileges
func AdminOnly(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	
	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		return c.Status(401).JSON(fiber.Map{"message": "User not found"})
	}

	if user.Role != "admin" && user.Role != "hr" {
		return c.Status(403).JSON(fiber.Map{"message": "Access denied: Administrator privileges required"})
	}

	return c.Next()
}
