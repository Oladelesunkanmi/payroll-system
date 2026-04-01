package main

import (
	"fmt"
	"github.com/Oladelesunkanmi/payroll-system/backend/internal/models"
	"github.com/Oladelesunkanmi/payroll-system/backend/pkg/database"
)

func main() {
	database.ConnectDB()
	var user models.User
	if err := database.DB.Where("email = ?", "admin@payrollpro.com").First(&user).Error; err == nil {
		user.Role = "admin"
		database.DB.Save(&user)
		fmt.Println("Successfully elevated admin@payrollpro.com to role: admin")
	} else {
		fmt.Println("Admin user not found in database")
	}
}
