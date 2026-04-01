package main

import (
	"fmt"
	"github.com/Oladelesunkanmi/payroll-system/backend/internal/models"
	"github.com/Oladelesunkanmi/payroll-system/backend/pkg/database"
)

func main() {
	database.ConnectDB()
	var users []models.User
	database.DB.Find(&users)
	fmt.Println("ID | Username | Email | Role")
	for _, u := range users {
		fmt.Printf("%d | %s | %s | %s\n", u.ID, u.Username, u.Email, u.Role)
	}
	var activityCount int64
	database.DB.Table("activities").Count(&activityCount)
	fmt.Printf("Activity count: %d\n", activityCount)
}
