package utils

import (
	"fmt"
	"github.com/Oladelesunkanmi/payroll-system/backend/internal/models"
	"github.com/Oladelesunkanmi/payroll-system/backend/pkg/database"
)

func LogActivity(action, category, details, icon, color string, userID uint) {
	activity := models.Activity{
		Action:   action,
		Category: category,
		Details:  details,
		Icon:     icon,
		Color:    color,
		UserID:   userID,
	}
	database.DB.Create(&activity)
	fmt.Printf("Logging Activity: %s for user %d\n", action, userID)
}
