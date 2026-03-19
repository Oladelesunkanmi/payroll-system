package handlers

import (
	"github.com/Oladelesunkanmi/payroll-system/backend/internal/models"
	"github.com/Oladelesunkanmi/payroll-system/backend/pkg/database"
	"github.com/gofiber/fiber/v2"
)

// GetAllDepartments returns a list of all departments
func GetAllDepartments(c *fiber.Ctx) error {
	var departments []models.Department
	database.DB.Preload("Employees").Find(&departments)
	return c.Status(200).JSON(departments)
}

// GetDepartment returns a single department by ID
func GetDepartment(c *fiber.Ctx) error {
	id := c.Params("id")
	var department models.Department
	result := database.DB.Preload("Employees").First(&department, id)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"message": "Department not found"})
	}
	return c.Status(200).JSON(department)
}

// CreateDepartment creates a new department
func CreateDepartment(c *fiber.Ctx) error {
	department := new(models.Department)
	if err := c.BodyParser(department); err != nil {
		return c.Status(400).JSON(fiber.Map{"message": err.Error()})
	}

	database.DB.Create(&department)
	return c.Status(201).JSON(department)
}

// UpdateDepartment updates an existing department
func UpdateDepartment(c *fiber.Ctx) error {
	id := c.Params("id")
	var department models.Department
	result := database.DB.First(&department, id)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"message": "Department not found"})
	}

	if err := c.BodyParser(&department); err != nil {
		return c.Status(400).JSON(fiber.Map{"message": err.Error()})
	}

	database.DB.Save(&department)
	return c.Status(200).JSON(department)
}

// DeleteDepartment deletes a department by ID
func DeleteDepartment(c *fiber.Ctx) error {
	id := c.Params("id")
	var department models.Department
	result := database.DB.First(&department, id)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"message": "Department not found"})
	}

	database.DB.Delete(&department)
	return c.Status(204).SendString("Department deleted successfully")
}
