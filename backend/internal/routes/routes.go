package routes

import (
	"github.com/Oladelesunkanmi/payroll-system/backend/internal/handlers"
	"github.com/Oladelesunkanmi/payroll-system/backend/internal/middleware"
	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) {
	// API Group with Middleware
	api := app.Group("/api", middleware.AuthRequired)

	// Auth Routes (Public)
	auth := app.Group("/auth")
	auth.Post("/login", handlers.Login)
	auth.Post("/signup", handlers.Signup)

	// Admin-Only Group
	admin := api.Group("/", middleware.AdminOnly)

	// Employee Routes (Admin only)
	employees := admin.Group("/employees")
	employees.Get("/", handlers.GetAllEmployees)
	employees.Get("/:id", handlers.GetEmployee)
	employees.Post("/", handlers.CreateEmployee)
	employees.Put("/:id", handlers.UpdateEmployee)
	employees.Delete("/:id", handlers.DeleteEmployee)

	// Payroll Routes
	payrolls := api.Group("/payrolls")
	payrolls.Get("/", middleware.AdminOnly, handlers.GetAllPayrolls)
	payrolls.Get("/:id", middleware.AdminOnly, handlers.GetPayroll)
	payrolls.Get("/employee/:employeeId", handlers.GetMyPayrolls)
	payrolls.Post("/", middleware.AdminOnly, handlers.CreatePayroll)
	payrolls.Post("/bulk-transfer", middleware.AdminOnly, handlers.ProcessBulkTransfer)
	payrolls.Put("/:id", middleware.AdminOnly, handlers.UpdatePayroll)
	payrolls.Delete("/:id", middleware.AdminOnly, handlers.DeletePayroll)

	// Stats Routes (Admin only)
	stats := admin.Group("/stats")
	stats.Get("/dashboard", handlers.GetDashboardStats)
	stats.Get("/reports", handlers.GetReportsData)
	stats.Get("/activity", handlers.GetRecentActivity)

	// Notifications
	notifications := api.Group("/notifications")
	notifications.Get("/", handlers.GetNotifications)
	notifications.Post("/read/:id", handlers.MarkNotificationRead)
	notifications.Post("/read-all", handlers.MarkNotificationsRead)

	// Department Routes (Admin only)
	departments := admin.Group("/departments")
	departments.Get("/", handlers.GetAllDepartments)
	departments.Get("/:id", handlers.GetDepartment)
	departments.Post("/", handlers.CreateDepartment)
	departments.Put("/:id", handlers.UpdateDepartment)
	departments.Delete("/:id", handlers.DeleteDepartment)

	// Attendance Routes (Admin/HR only for writes)
	attendance := admin.Group("/attendance")
	attendance.Get("/", handlers.GetAttendance)
	attendance.Post("/", handlers.MarkAttendance)
	attendance.Post("/bulk", handlers.BulkMarkAttendance)
	attendance.Get("/employee/:id", handlers.GetEmployeeMonthlyAttendance)
	attendance.Get("/summary/:id", handlers.GetAttendanceSummary)

	// Health Check Route
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.Status(200).JSON(fiber.Map{
			"status":  "success",
			"message": "Payroll System API is running",
		})
	})
}
