package handlers

import (
	"github.com/Oladelesunkanmi/payroll-system/backend/internal/models"
	"github.com/Oladelesunkanmi/payroll-system/backend/pkg/database"
	"github.com/gofiber/fiber/v2"
)

// GetAllEmployees returns a list of all employees
func GetAllEmployees(c *fiber.Ctx) error {
	var employees []models.Employee
	database.DB.Preload("Department").Find(&employees)
	return c.Status(200).JSON(employees)
}

// GetEmployee returns a single employee by ID
func GetEmployee(c *fiber.Ctx) error {
	id := c.Params("id")
	var employee models.Employee
	result := database.DB.Preload("Department").First(&employee, id)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"message": "Employee not found"})
	}
	return c.Status(200).JSON(employee)
}

// CreateEmployee creates a new employee
func CreateEmployee(c *fiber.Ctx) error {
	employee := new(models.Employee)
	if err := c.BodyParser(employee); err != nil {
		return c.Status(400).JSON(fiber.Map{"message": err.Error()})
	}

	database.DB.Create(&employee)
	return c.Status(201).JSON(employee)
}

// UpdateEmployee updates an existing employee
func UpdateEmployee(c *fiber.Ctx) error {
	id := c.Params("id")
	var employee models.Employee
	result := database.DB.First(&employee, id)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"message": "Employee not found"})
	}

	if err := c.BodyParser(&employee); err != nil {
		return c.Status(400).JSON(fiber.Map{"message": err.Error()})
	}

	database.DB.Save(&employee)
	return c.Status(200).JSON(employee)
}

// DeleteEmployee deletes an employee by ID
func DeleteEmployee(c *fiber.Ctx) error {
	id := c.Params("id")
	var employee models.Employee
	result := database.DB.First(&employee, id)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"message": "Employee not found"})
	}

	database.DB.Delete(&employee)
	return c.Status(204).SendString("Employee deleted successfully")
}
