package handlers

import (
	"time"

	"github.com/Oladelesunkanmi/payroll-system/backend/internal/models"
	"github.com/Oladelesunkanmi/payroll-system/backend/pkg/database"
	"github.com/gofiber/fiber/v2"
)

// GetAllPayrolls returns a list of all payroll records for the current month
func GetAllPayrolls(c *fiber.Ctx) error {
	var employees []models.Employee
	database.DB.Find(&employees)

	now := time.Now()
	monthStart := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	monthEnd := monthStart.AddDate(0, 1, -1)

	for _, emp := range employees {
		var payroll models.Payroll
		result := database.DB.Where("employee_id = ? AND period_start >= ? AND period_start <= ?", emp.ID, monthStart, monthEnd).First(&payroll)
		if result.Error != nil {
			// Create pending payroll for this month
			newPayroll := models.Payroll{
				EmployeeID:    emp.ID,
				BasicSalary:   emp.Salary,
				Allowances:    0,
				Deductions:    0,
				NetSalary:     emp.Salary,
				PaymentStatus: "Pending",
				PeriodStart:   monthStart,
				PeriodEnd:     monthEnd,
			}
			database.DB.Create(&newPayroll)
		}
	}

	var payrolls []models.Payroll
	database.DB.Preload("Employee.Department").Where("period_start >= ? AND period_start <= ?", monthStart, monthEnd).Find(&payrolls)
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
