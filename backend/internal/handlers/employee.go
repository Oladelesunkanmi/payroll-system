package handlers

import (
	"fmt"
	"github.com/Oladelesunkanmi/payroll-system/backend/internal/models"
	"github.com/Oladelesunkanmi/payroll-system/backend/pkg/database"
	"github.com/Oladelesunkanmi/payroll-system/backend/pkg/utils"
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
	database.DB.Preload("Department").First(&employee, employee.ID)

	// Log Activity
	userID := c.Locals("user_id").(uint)
	utils.LogActivity(
		"Employee Created",
		"employees",
		fmt.Sprintf("Added %s %s to %s", employee.FirstName, employee.LastName, employee.Department.Name),
		"UserPlus",
		"text-emerald-500",
		userID,
	)

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
	database.DB.Preload("Department").First(&employee, employee.ID)

	// Log Activity
	userID := c.Locals("user_id").(uint)
	utils.LogActivity(
		"Employee Updated",
		"employees",
		fmt.Sprintf("Updated details for %s %s", employee.FirstName, employee.LastName),
		"Edit2",
		"text-blue-500",
		userID,
	)

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

	// Log Activity
	userID := c.Locals("user_id").(uint)
	utils.LogActivity(
		"Employee Deleted",
		"employees",
		fmt.Sprintf("Removed %s %s from the system", employee.FirstName, employee.LastName),
		"UserMinus",
		"text-red-500",
		userID,
	)

	return c.Status(204).SendString("Employee deleted successfully")
}
