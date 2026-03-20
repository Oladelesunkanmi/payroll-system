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

	// Employee Routes
	employees := api.Group("/employees")
	employees.Get("/", handlers.GetAllEmployees)
	employees.Get("/:id", handlers.GetEmployee)
	employees.Post("/", handlers.CreateEmployee)
	employees.Put("/:id", handlers.UpdateEmployee)
	employees.Delete("/:id", handlers.DeleteEmployee)

	// Payroll Routes
	payrolls := api.Group("/payrolls")
	payrolls.Get("/", handlers.GetAllPayrolls)
	payrolls.Get("/:id", handlers.GetPayroll)
	payrolls.Get("/employee/:employeeId", handlers.GetMyPayrolls)
	payrolls.Post("/", handlers.CreatePayroll)
	payrolls.Put("/:id", handlers.UpdatePayroll)
	payrolls.Delete("/:id", handlers.DeletePayroll)

	// Stats Routes
	stats := api.Group("/stats")
	stats.Get("/dashboard", handlers.GetDashboardStats)
	stats.Get("/reports", handlers.GetReportsData)

	// Department Routes
	departments := api.Group("/departments")
	departments.Get("/", handlers.GetAllDepartments)
	departments.Get("/:id", handlers.GetDepartment)
	departments.Post("/", handlers.CreateDepartment)
	departments.Put("/:id", handlers.UpdateDepartment)
	departments.Delete("/:id", handlers.DeleteDepartment)

	// Health Check Route
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.Status(200).JSON(fiber.Map{
			"status":  "success",
			"message": "Payroll System API is running",
		})
	})
}
