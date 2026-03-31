package handlers

import (
	"fmt"
	"github.com/Oladelesunkanmi/payroll-system/backend/internal/models"
	"github.com/Oladelesunkanmi/payroll-system/backend/pkg/database"
	"github.com/Oladelesunkanmi/payroll-system/backend/pkg/utils"
	"github.com/gofiber/fiber/v2"
)

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type SignupRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

func Signup(c *fiber.Ctx) error {
	req := new(SignupRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(400).JSON(fiber.Map{"message": err.Error()})
	}

	user := models.User{
		Username: req.Username,
		Email:    req.Email,
	}

	if err := user.HashPassword(req.Password); err != nil {
		return c.Status(500).JSON(fiber.Map{"message": "Could not hash password"})
	}

	result := database.DB.Create(&user)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"message": "Could not create user"})
	}

	token, err := utils.GenerateToken(user.ID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"message": "Could not generate token"})
	}

	// Link to employee if exists
	var employee models.Employee
	var empID *uint
	if err := database.DB.Where("email = ?", user.Email).First(&employee).Error; err == nil {
		empID = &employee.ID
	}

	// Log Activity
	utils.LogActivity(
		"New User Registered",
		"auth",
		fmt.Sprintf("%s joined the system", user.Username),
		"UserPlus",
		"text-emerald-500",
		user.ID,
	)

	return c.Status(201).JSON(fiber.Map{
		"user":        user,
		"token":       token,
		"employee_id": empID,
	})
}

func Login(c *fiber.Ctx) error {
	req := new(LoginRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(400).JSON(fiber.Map{"message": err.Error()})
	}

	var user models.User
	result := database.DB.Where("email = ?", req.Email).First(&user)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"message": "User not found"})
	}

	if err := user.CheckPassword(req.Password); err != nil {
		return c.Status(401).JSON(fiber.Map{"message": "Invalid password"})
	}

	token, err := utils.GenerateToken(user.ID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"message": "Could not generate token"})
	}

	// Link to employee if exists
	var employee models.Employee
	var empID *uint
	if err := database.DB.Where("email = ?", user.Email).First(&employee).Error; err == nil {
		empID = &employee.ID
	}

	// Log Activity
	utils.LogActivity(
		"User Logged In",
		"auth",
		fmt.Sprintf("%s accessed the system", user.Username),
		"LogIn",
		"text-blue-500",
		user.ID,
	)

	return c.Status(200).JSON(fiber.Map{
		"user":        user,
		"token":       token,
		"employee_id": empID,
	})
}
