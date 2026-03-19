package handlers

import (
	"github.com/Oladelesunkanmi/payroll-system/backend/internal/models"
	"github.com/Oladelesunkanmi/payroll-system/backend/pkg/database"
	"github.com/gofiber/fiber/v2"
)

// GetAllPayrolls returns a list of all payroll records
func GetAllPayrolls(c *fiber.Ctx) error {
	var payrolls []models.Payroll
	database.DB.Preload("Employee.Department").Find(&payrolls)
	return c.Status(200).JSON(payrolls)
}

// GetPayroll returns a single payroll record by ID
func GetPayroll(c *fiber.Ctx) error {
	id := c.Params("id")
	var payroll models.Payroll
	result := database.DB.Preload("Employee.Department").First(&payroll, id)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"message": "Payroll record not found"})
	}
	return c.Status(200).JSON(payroll)
}

// CreatePayroll creates a new payroll record
func CreatePayroll(c *fiber.Ctx) error {
	payroll := new(models.Payroll)
	if err := c.BodyParser(payroll); err != nil {
		return c.Status(400).JSON(fiber.Map{"message": err.Error()})
	}

	// Calculate Net Salary if not provided
	if payroll.NetSalary == 0 {
		payroll.NetSalary = payroll.BasicSalary + payroll.Allowances - payroll.Deductions
	}

	database.DB.Create(&payroll)
	database.DB.Preload("Employee").First(&payroll, payroll.ID)
	return c.Status(201).JSON(payroll)
}

// UpdatePayroll updates an existing payroll record
func UpdatePayroll(c *fiber.Ctx) error {
	id := c.Params("id")
	var payroll models.Payroll
	result := database.DB.First(&payroll, id)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"message": "Payroll record not found"})
	}

	if err := c.BodyParser(&payroll); err != nil {
		return c.Status(400).JSON(fiber.Map{"message": err.Error()})
	}

	// Recalculate Net Salary
	payroll.NetSalary = payroll.BasicSalary + payroll.Allowances - payroll.Deductions

	database.DB.Save(&payroll)
	database.DB.Preload("Employee").First(&payroll, payroll.ID)
	return c.Status(200).JSON(payroll)
}

// DeletePayroll deletes a payroll record by ID
func DeletePayroll(c *fiber.Ctx) error {
	id := c.Params("id")
	var payroll models.Payroll
	result := database.DB.First(&payroll, id)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"message": "Payroll record not found"})
	}

	database.DB.Delete(&payroll)
	return c.Status(204).SendString("Payroll record deleted successfully")
}

// GetMyPayrolls returns payroll records for a specific employee
func GetMyPayrolls(c *fiber.Ctx) error {
	employeeID := c.Params("employeeId")
	var payrolls []models.Payroll
	database.DB.Preload("Employee.Department").Where("employee_id = ?", employeeID).Find(&payrolls)
	return c.Status(200).JSON(payrolls)
}
