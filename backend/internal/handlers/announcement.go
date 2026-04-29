package handlers

import (
	"github.com/Oladelesunkanmi/payroll-system/backend/internal/models"
	"github.com/Oladelesunkanmi/payroll-system/backend/pkg/database"
	"github.com/Oladelesunkanmi/payroll-system/backend/pkg/utils"
	"github.com/gofiber/fiber/v2"
)

func CreateAnnouncement(c *fiber.Ctx) error {
	adminID := c.Locals("user_id").(uint)
	
	var announcement models.Announcement
	if err := c.BodyParser(&announcement); err != nil {
		return c.Status(400).JSON(fiber.Map{"message": "Invalid request body"})
	}

	announcement.SenderID = adminID

	if err := database.DB.Create(&announcement).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"message": "Could not create announcement"})
	}

	// Log Activity
	utils.LogActivity(
		"Broadcast Message",
		"communication",
		announcement.Title,
		"Bell",
		"text-amber-500",
		adminID,
	)

	return c.Status(201).JSON(announcement)
}

func GetAllAnnouncements(c *fiber.Ctx) error {
	var announcements []models.Announcement
	database.DB.Preload("Sender").Preload("Department").Order("created_at desc").Find(&announcements)
	return c.JSON(announcements)
}

func GetMyAnnouncements(c *fiber.Ctx) error {
	// This would be for employees to see messages relevant to them
	// For now, return all since we don't have complex permission scoping on the frontend for users
	return GetAllAnnouncements(c)
}

func DeleteAnnouncement(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := database.DB.Delete(&models.Announcement{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"message": "Could not delete announcement"})
	}
	return c.SendStatus(204)
}
