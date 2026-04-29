package handlers

import (
	"strconv"
	"time"

	"github.com/Oladelesunkanmi/payroll-system/backend/internal/models"
	"github.com/Oladelesunkanmi/payroll-system/backend/pkg/database"
	"github.com/gofiber/fiber/v2"
)

func GetDashboardStats(c *fiber.Ctx) error {
	var totalEmployees int64
	var totalDepartments int64
	var processedPayrolls int64
	var pendingPayrolls int64
	var calculatedPayrolls int64
	var totalSalaryPaid float64
	var totalSalaryBudget float64
	var newEmployeesThisMonth int64
	var lastMonthSalaryPaid float64

	database.DB.Model(&models.Employee{}).Count(&totalEmployees)
	database.DB.Model(&models.Department{}).Count(&totalDepartments)
	database.DB.Model(&models.Payroll{}).Where("payment_status = ?", "Processed").Count(&processedPayrolls)
	database.DB.Model(&models.Payroll{}).Where("payment_status = ?", "Pending").Count(&pendingPayrolls)
	database.DB.Model(&models.Payroll{}).Where("payment_status = ?", "Calculated").Count(&calculatedPayrolls)

	// Total salary paid (only Processed status)
	database.DB.Model(&models.Payroll{}).
		Where("payment_status = ?", "Processed").
		Select("COALESCE(SUM(net_salary), 0)").
		Row().Scan(&totalSalaryPaid)

	// Monthly salary budget from employee table (sum of all current base salaries)
	database.DB.Model(&models.Employee{}).
		Select("COALESCE(SUM(salary), 0)").
		Row().Scan(&totalSalaryBudget)

	// Employees hired this month
	now := time.Now()
	monthStart := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	database.DB.Model(&models.Employee{}).
		Where("date_hired >= ?", monthStart).
		Count(&newEmployeesThisMonth)

	// Last month's payroll total for comparison
	lastMonthStart := monthStart.AddDate(0, -1, 0)
	database.DB.Model(&models.Payroll{}).
		Where("period_start >= ? AND period_start < ?", lastMonthStart, monthStart).
		Select("COALESCE(SUM(net_salary), 0)").
		Row().Scan(&lastMonthSalaryPaid)

	// This month's payroll total (only Processed)
	var thisMonthSalaryPaid float64
	database.DB.Model(&models.Payroll{}).
		Where("period_start >= ? AND payment_status = ?", monthStart, "Processed").
		Select("COALESCE(SUM(net_salary), 0)").
		Row().Scan(&thisMonthSalaryPaid)

	// Calculate month-over-month percentage change
	var salaryChangePercent float64
	if lastMonthSalaryPaid > 0 {
		salaryChangePercent = ((thisMonthSalaryPaid - lastMonthSalaryPaid) / lastMonthSalaryPaid) * 100
	}

	return c.JSON(fiber.Map{
		"total_employees":        totalEmployees,
		"total_departments":      totalDepartments,
		"processed_payrolls":     processedPayrolls,
		"pending_payrolls":       pendingPayrolls,
		"calculated_payrolls":    calculatedPayrolls,
		"total_salary_paid":      totalSalaryPaid,
		"total_salary_budget":    totalSalaryBudget,
		"this_month_salary":      thisMonthSalaryPaid,
		"last_month_salary":      lastMonthSalaryPaid,
		"salary_change_percent":  salaryChangePercent,
		"new_employees_month":    newEmployeesThisMonth,
	})
}

func GetRecentActivity(c *fiber.Ctx) error {
	var activities []models.Activity
	database.DB.Preload("User").Order("created_at desc").Limit(10).Find(&activities)
	return c.JSON(activities)
}

func GetNotifications(c *fiber.Ctx) error {
	var activities []models.Activity
	database.DB.Preload("User").Order("created_at desc").Limit(10).Find(&activities)
	return c.JSON(activities)
}

func MarkNotificationRead(c *fiber.Ctx) error {
	idParam := c.Params("id")
	id, err := strconv.ParseUint(idParam, 10, 64)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"message": "Invalid notification ID"})
	}

	var activity models.Activity
	if err := database.DB.First(&activity, uint(id)).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"message": "Notification not found"})
	}

	activity.Read = true
	if err := database.DB.Save(&activity).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"message": "Could not mark notification as read"})
	}

	return c.JSON(activity)
}

func MarkNotificationsRead(c *fiber.Ctx) error {
	result := database.DB.Model(&models.Activity{}).Where("read = ?", false).Update("read", true)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"message": "Could not mark notifications as read"})
	}

	return c.JSON(fiber.Map{"updated": result.RowsAffected})
}

func GetReportsData(c *fiber.Ctx) error {
	monthStr := c.Query("month")
	yearStr := c.Query("year")

	now := time.Now()
	month := int(now.Month())
	year := now.Year()

	if monthStr != "" {
		if m, err := strconv.Atoi(monthStr); err == nil && m >= 1 && m <= 12 {
			month = m
		}
	}
	if yearStr != "" {
		if y, err := strconv.Atoi(yearStr); err == nil && y > 1900 {
			year = y
		}
	}

	monthStart := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.Local)
	monthEnd := monthStart.AddDate(0, 1, -1)

	// Monthly Payroll Totals (Last 6 months leading up to selected month)
	type MonthlyTotal struct {
		Month string  `json:"month"`
		Total float64 `json:"total"`
	}
	var monthlyTotals []MonthlyTotal
	database.DB.Model(&models.Payroll{}).
		Select("to_char(period_start, 'Mon YYYY') as month, SUM(net_salary) as total").
		Where("period_start <= ?", monthEnd).
		Group("month").
		Order("MIN(period_start) DESC").
		Limit(6).
		Scan(&monthlyTotals)

	// Reverse for chronological order in chart
	for i, j := 0, len(monthlyTotals)-1; i < j; i, j = i+1, j-1 {
		monthlyTotals[i], monthlyTotals[j] = monthlyTotals[j], monthlyTotals[i]
	}

	// Department Distribution for the SELECTED month
	type DeptDist struct {
		Name        string  `json:"name"`
		Count       int64   `json:"count"`
		TotalSalary float64 `json:"total_salary"`
	}
	var deptDists []DeptDist
	database.DB.Table("departments").
		Select("departments.name, COUNT(DISTINCT payrolls.id) as count, COALESCE(SUM(payrolls.net_salary), 0) as total_salary").
		Joins("LEFT JOIN employees ON employees.department_id = departments.id AND employees.deleted_at IS NULL").
		Joins("LEFT JOIN payrolls ON payrolls.employee_id = employees.id AND payrolls.period_start >= ? AND payrolls.period_start <= ?", monthStart, monthEnd).
		Where("departments.deleted_at IS NULL").
		Group("departments.name").
		Scan(&deptDists)

	return c.JSON(fiber.Map{
		"monthly_totals":          monthlyTotals,
		"department_distribution": deptDists,
	})
}
