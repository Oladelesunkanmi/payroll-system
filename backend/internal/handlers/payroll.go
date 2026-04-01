package handlers

import (
	"fmt"
	"time"

	"github.com/Oladelesunkanmi/payroll-system/backend/internal/models"
	"github.com/Oladelesunkanmi/payroll-system/backend/pkg/database"
	"github.com/Oladelesunkanmi/payroll-system/backend/pkg/paystack"
	"github.com/Oladelesunkanmi/payroll-system/backend/pkg/utils"
	"github.com/gofiber/fiber/v2"
)

// CalculateNigerianPIT calculates the monthly tax based on the Finance Act 2020 (P.A.Y.E.)
func CalculateNigerianPIT(monthlyGross float64) float64 {
	annualGross := monthlyGross * 12
	if annualGross <= 0 {
		return 0
	}

	// 1. Statutory Deductions (Standard 50-30-20 split assumed)
	basic := annualGross * 0.50
	housing := annualGross * 0.30
	transport := annualGross * 0.20

	pension := (basic + housing + transport) * 0.08
	nhf := basic * 0.025
	// Total Statutory Deductions
	totalDeductions := pension + nhf

	// 2. Consolidated Relief Allowance (CRA)
	// Max(200k, 1% of Gross) + 20% of Gross
	reliefBase := 200000.0
	if 0.01*annualGross > reliefBase {
		reliefBase = 0.01 * annualGross
	}
	cra := reliefBase + (0.20 * annualGross)

	// 3. Taxable Income
	taxableIncome := annualGross - cra - totalDeductions
	if taxableIncome <= 0 {
		// Minimum Tax: 1% of Gross Income if taxable income is zero or negative
		return (annualGross * 0.01) / 12
	}

	// 4. Annual PIT Brackets (Finance Act 2020)
	var annualTax float64
	remaining := taxableIncome

	// Bracket 1: First 300,000 @ 7%
	if remaining > 300000 {
		annualTax += 300000 * 0.07
		remaining -= 300000
	} else {
		annualTax += remaining * 0.07
		return annualTax / 12
	}

	// Bracket 2: Next 300,000 @ 11%
	if remaining > 300000 {
		annualTax += 300000 * 0.11
		remaining -= 300000
	} else {
		annualTax += remaining * 0.11
		return annualTax / 12
	}

	// Bracket 3: Next 500,000 @ 15%
	if remaining > 500000 {
		annualTax += 500000 * 0.15
		remaining -= 500000
	} else {
		annualTax += remaining * 0.15
		return annualTax / 12
	}

	// Bracket 4: Next 500,000 @ 19%
	if remaining > 500000 {
		annualTax += 500000 * 0.19
		remaining -= 500000
	} else {
		annualTax += remaining * 0.19
		return annualTax / 12
	}

	// Bracket 5: Next 1,600,000 @ 21%
	if remaining > 1600000 {
		annualTax += 1600000 * 0.21
		remaining -= 1600000
	} else {
		annualTax += remaining * 0.21
		return annualTax / 12
	}

	// Bracket 6: Above 3,200,000 @ 24%
	annualTax += remaining * 0.24

	monthlyTax := annualTax / 12
	
	// Minimum Tax Check: 1% of Gross
	minTax := (annualGross * 0.01) / 12
	if monthlyTax < minTax {
		return minTax
	}

	return monthlyTax
}

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
			// Calculate official Nigerian PIT
			tax := CalculateNigerianPIT(emp.Salary)
			
			// Create pending payroll for this month
			newPayroll := models.Payroll{
				EmployeeID:    emp.ID,
				BasicSalary:   emp.Salary,
				Allowances:    0,
				Deductions:    0,
				Tax:           tax,
				NetSalary:     emp.Salary - tax,
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
		payroll.NetSalary = payroll.BasicSalary + payroll.Allowances - payroll.Deductions - payroll.Tax
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
	payroll.NetSalary = payroll.BasicSalary + payroll.Allowances - payroll.Deductions - payroll.Tax

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
	requestedEmployeeID := c.Params("employeeId")
	userID := c.Locals("user_id").(uint)

	var user models.User
	database.DB.First(&user, userID)

	// If not admin/hr, verify they are requesting their own ID
	if user.Role != "admin" && user.Role != "hr" {
		var employee models.Employee
		if err := database.DB.Where("email = ? AND id = ?", user.Email, requestedEmployeeID).First(&employee).Error; err != nil {
			return c.Status(403).JSON(fiber.Map{"message": "Unauthorized access to other employee's data"})
		}
	}

	var payrolls []models.Payroll
	database.DB.Preload("Employee.Department").Where("employee_id = ?", requestedEmployeeID).Find(&payrolls)
	return c.Status(200).JSON(payrolls)
}

// ProcessBulkTransfer initiates the Paystack bulk transfer process
func ProcessBulkTransfer(c *fiber.Ctx) error {
	var payrolls []models.Payroll
	database.DB.Preload("Employee").Where("payment_status = ?", "Pending").Find(&payrolls)

	if len(payrolls) == 0 {
		return c.Status(400).JSON(fiber.Map{"message": "No pending payrolls to process"})
	}

	var transfers []paystack.BulkTransferItem

	for i := range payrolls {
		p := &payrolls[i]
		emp := &p.Employee

		// Ensure recipient code exists
		if emp.PaystackRecipientCode == "" {
			recipientCode, err := paystack.CreateTransferRecipient(
				fmt.Sprintf("%s %s", emp.FirstName, emp.LastName),
				emp.AccountNumber,
				emp.BankCode,
			)
			if err != nil {
				return c.Status(500).JSON(fiber.Map{"message": fmt.Sprintf("Failed to create recipient for %s: %v", emp.Email, err)})
			}
			emp.PaystackRecipientCode = recipientCode
			database.DB.Save(emp)
		}

		transfers = append(transfers, paystack.BulkTransferItem{
			Amount:    int(p.NetSalary * 100), // Convert to kobo
			Recipient: emp.PaystackRecipientCode,
		})
	}

	// Initiate bulk transfer
	msg, err := paystack.InitiateBulkTransfer(transfers)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"message": err.Error()})
	}

	// Update status to Processed
	for i := range payrolls {
		payrolls[i].PaymentStatus = "Processed"
		database.DB.Save(&payrolls[i])
	}

	// Log Activity
	adminID := c.Locals("user_id").(uint)
	utils.LogActivity(
		"Payroll Processed",
		"payroll",
		fmt.Sprintf("Disbursed salaries to %d employees via Paystack", len(payrolls)),
		"CreditCard",
		"text-primary-500",
		adminID,
	)

	return c.Status(200).JSON(fiber.Map{"message": msg, "count": len(payrolls)})
}
