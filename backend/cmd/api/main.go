package main

import (
	"log"
	"os"

	"time"

	"github.com/Oladelesunkanmi/payroll-system/backend/internal/config"
	"github.com/Oladelesunkanmi/payroll-system/backend/internal/models"
	"github.com/Oladelesunkanmi/payroll-system/backend/internal/routes"
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

	// Run Database Migrations
	config.Migrate(database.DB)

	// Seed Initial Data
	SeedData()

	// Initialize Fiber App
	app := fiber.New()

	// Middleware
	app.Use(cors.New())

	// Setup Routes
	routes.SetupRoutes(app)

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
				Salary:       850000,
			}
			if err := database.DB.Create(&emp).Error; err == nil {
				// Create a initial payroll record for Sarah so she shows up in the Payroll page
				payroll := models.Payroll{
					EmployeeID:    emp.ID,
					BasicSalary:   emp.Salary,
					Allowances:    0,
					Deductions:    0,
					NetSalary:     emp.Salary,
					PaymentStatus: "Pending",
					PeriodStart:   time.Now().AddDate(0, 0, -30),
					PeriodEnd:     time.Now(),
				}
				database.DB.Create(&payroll)
			} else {
				log.Printf("Failed to create initial employee: %v\n", err)
			}
		}
	}
	log.Println("Data seeding completed.")
}
