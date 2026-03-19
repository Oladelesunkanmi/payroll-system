package handlers

import (
	"github.com/Oladelesunkanmi/payroll-system/backend/internal/models"
	"github.com/Oladelesunkanmi/payroll-system/backend/pkg/database"
	"github.com/gofiber/fiber/v2"
)

func GetDashboardStats(c *fiber.Ctx) error {
	var totalEmployees int64
	var totalDepartments int64
	var processedPayrolls int64
	var pendingPayrolls int64
	var totalSalaryPaid float64

	database.DB.Model(&models.Employee{}).Count(&totalEmployees)
	database.DB.Model(&models.Department{}).Count(&totalDepartments)
	database.DB.Model(&models.Payroll{}).Where("payment_status = ?", "Processed").Count(&processedPayrolls)
	database.DB.Model(&models.Payroll{}).Where("payment_status = ?", "Pending").Count(&pendingPayrolls)

	database.DB.Model(&models.Payroll{}).Where("payment_status = ?", "Processed").Select("SUM(net_salary)").Row().Scan(&totalSalaryPaid)

	return c.JSON(fiber.Map{
		"total_employees":    totalEmployees,
		"total_departments":  totalDepartments,
		"processed_payrolls": processedPayrolls,
		"pending_payrolls":   pendingPayrolls,
		"total_salary_paid":  totalSalaryPaid,
	})
}

func GetReportsData(c *fiber.Ctx) error {
	// Monthly Payroll Totals (Last 6 months)
	type MonthlyTotal struct {
		Month string  `json:"month"`
		Total float64 `json:"total"`
	}
	var monthlyTotals []MonthlyTotal
	// This is a simplified version; real app might need more complex grouping
	database.DB.Model(&models.Payroll{}).
		Select("to_char(period_start, 'Mon YYYY') as month, SUM(net_salary) as total").
		Group("month, period_start").
		Order("period_start").
		Limit(6).
		Scan(&monthlyTotals)

	// Department Distribution
	type DeptDist struct {
		Name  string `json:"name"`
		Count int64  `json:"count"`
		TotalSalary float64 `json:"total_salary"`
	}
	var deptDists []DeptDist
	database.DB.Table("departments").
		Select("departments.name, count(employees.id) as count, sum(payrolls.net_salary) as total_salary").
		Joins("left join employees on employees.department_id = departments.id").
		Joins("left join payrolls on payrolls.employee_id = employees.id").
		Group("departments.name").
		Scan(&deptDists)

	return c.JSON(fiber.Map{
		"monthly_totals": monthlyTotals,
		"department_distribution": deptDists,
	})
}
