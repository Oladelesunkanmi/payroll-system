package main

import (
	"fmt"
	"log"
	"os"

	"math/rand"
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

	deptIDs := make([]uint, 0)
	for _, d := range depts {
		var existing models.Department
		if err := database.DB.Where("name = ?", d.Name).First(&existing).Error; err != nil {
			log.Printf("Creating department: %s\n", d.Name)
			if err := database.DB.Create(&d).Error; err == nil {
				deptIDs = append(deptIDs, d.ID)
			}
		} else {
			deptIDs = append(deptIDs, existing.ID)
		}
	}

	// Seed Users
	users := []models.User{
		{Username: "admin", Email: "admin@payrollpro.com", Role: "admin"},
		{Username: "hr", Email: "hr@payrollpro.com", Role: "hr"},
		{Username: "user", Email: "user@company.com", Role: "user"},
	}

	passwords := map[string]string{
		"admin@payrollpro.com": "admin123",
		"hr@payrollpro.com":    "hr123",
		"user@company.com":     "user123",
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
		}
	}

	// Controlled Employee Seeding (10 employees, salary 150k-250k)
	var empCount int64
	database.DB.Model(&models.Employee{}).Count(&empCount)
	if empCount == 0 && len(deptIDs) > 0 {
		log.Println("Seeding 10 employees with requested salary range...")
		
		firstNames := []string{"James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth"}
		lastNames := []string{"Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"}

		for i := 0; i < 10; i++ {
			salary := float64(150000 + rand.Intn(100000))
			emp := models.Employee{
				FirstName:    firstNames[i],
				LastName:     lastNames[rand.Intn(len(lastNames))],
				Email:        fmt.Sprintf("%s.%s%d@company.com", firstNames[i], lastNames[i], i),
				Position:     "Specialist",
				DepartmentID: deptIDs[rand.Intn(len(deptIDs))],
				Salary:       salary,
				DateHired:    time.Now().AddDate(0, 0, -rand.Intn(1000)),
				AccountNumber: fmt.Sprintf("01 2345 67%d", 10+i),
				BankCode:      "058",
				BankName:      "GTBank",
			}
			if err := database.DB.Create(&emp).Error; err == nil {
				// History: Last month's payroll (Processed)
				lastMonthStart := time.Now().AddDate(0, -1, 0)
				lastMonthStart = time.Date(lastMonthStart.Year(), lastMonthStart.Month(), 1, 0, 0, 0, 0, time.Local)
				lastMonthEnd := lastMonthStart.AddDate(0, 1, -1)
				
				database.DB.Create(&models.Payroll{
					EmployeeID:    emp.ID,
					BasicSalary:   emp.Salary,
					NetSalary:     emp.Salary * 0.9, // Simplified net salary
					PaymentStatus: "Processed",
					PeriodStart:   lastMonthStart,
					PeriodEnd:     lastMonthEnd,
				})

				// Future: This month's payroll (Pending)
				thisMonthStart := time.Date(time.Now().Year(), time.Now().Month(), 1, 0, 0, 0, 0, time.Local)
				thisMonthEnd := thisMonthStart.AddDate(0, 1, -1)
				
				database.DB.Create(&models.Payroll{
					EmployeeID:    emp.ID,
					BasicSalary:   emp.Salary,
					NetSalary:     emp.Salary * 0.9,
					PaymentStatus: "Pending",
					PeriodStart:   thisMonthStart,
					PeriodEnd:     thisMonthEnd,
				})
			}
		}
	}

	log.Println("Data seeding completed.")
}
