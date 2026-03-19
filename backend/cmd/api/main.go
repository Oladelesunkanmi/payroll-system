package main

import (
	"log"
	"os"

	"github.com/Oladelesunkanmi/payroll-system/backend/internal/handlers"
	"github.com/Oladelesunkanmi/payroll-system/backend/internal/middleware"
	"github.com/Oladelesunkanmi/payroll-system/backend/internal/models"
	"github.com/Oladelesunkanmi/payroll-system/backend/pkg/database"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	// Connect to Database
	database.ConnectDB()

	// Auto Migration
	database.DB.AutoMigrate(&models.Employee{}, &models.Payroll{}, &models.Department{}, &models.User{})

	// Seed Initial Data
	SeedData()

	// Initialize Fiber App
	app := fiber.New()

	// Middleware
	app.Use(cors.New())

	// API Group with Middleware
	api := app.Group("/api", middleware.AuthRequired)

	// Auth Routes (Public)
	auth := app.Group("/auth")
	auth.Post("/login", handlers.Login)
	auth.Post("/signup", handlers.Signup)

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

	// Get Port from env
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	// Start Server
	log.Fatal(app.Listen(":" + port))
}

func SeedData() {
	log.Println("Starting data seeding...")

	// Seed Departments
	depts := []models.Department{
		{Name: "Engineering"},
		{Name: "Marketing"},
		{Name: "Finance"},
		{Name: "HR"},
		{Name: "Sales"},
	}

	for _, d := range depts {
		var existing models.Department
		if err := database.DB.Where("name = ?", d.Name).First(&existing).Error; err != nil {
			log.Printf("Creating department: %s\n", d.Name)
			if err := database.DB.Create(&d).Error; err != nil {
				log.Printf("Failed to create department %s: %v\n", d.Name, err)
			}
		}
	}

	// Seed Users
	users := []models.User{
		{Username: "admin", Email: "admin@payrollpro.com", Role: "admin"},
		{Username: "hr", Email: "hr@payrollpro.com", Role: "hr"},
		{Username: "sarah", Email: "sarah.johnson@company.com", Role: "user"},
	}

	passwords := map[string]string{
		"admin@payrollpro.com":      "admin123",
		"hr@payrollpro.com":         "hr123",
		"sarah.johnson@company.com": "emp123",
	}

	for _, u := range users {
		var existing models.User
		if err := database.DB.Where("email = ?", u.Email).First(&existing).Error; err != nil {
			log.Printf("Seeding user: %s (%s)\n", u.Username, u.Email)
			if err := u.HashPassword(passwords[u.Email]); err != nil {
				log.Printf("Failed to hash password for %s: %v\n", u.Email, err)
				continue
			}
			if err := database.DB.Create(&u).Error; err != nil {
				log.Printf("Failed to create user %s: %v\n", u.Email, err)
			}
		} else {
			log.Printf("User already exists: %s\n", u.Email)
		}
	}

	// Seed some employees if none exist
	var count int64
	database.DB.Model(&models.Employee{}).Count(&count)
	if count == 0 {
		var eng models.Department
		if err := database.DB.Where("name = ?", "Engineering").First(&eng).Error; err == nil {
			log.Println("Seeding initial employee...")
			emp := models.Employee{
				FirstName:    "Sarah",
				LastName:     "Johnson",
				Email:        "sarah.johnson@company.com",
				DepartmentID: eng.ID,
				Position:     "Senior Developer",
				Salary:       95000,
			}
			if err := database.DB.Create(&emp).Error; err != nil {
				log.Printf("Failed to create initial employee: %v\n", err)
			}
		}
	}
	log.Println("Data seeding completed.")
}
