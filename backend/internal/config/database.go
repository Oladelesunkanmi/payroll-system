package config

import (
	"log"

	"github.com/Oladelesunkanmi/payroll-system/backend/internal/models"
	"gorm.io/gorm"
)

func Migrate(db *gorm.DB) {
	log.Println("Running database migrations...")
	err := db.AutoMigrate(
		&models.Employee{},
		&models.Payroll{},
		&models.Department{},
		&models.User{},
		&models.Activity{},
		&models.Attendance{},
	)
	if err != nil {
		log.Fatalf("Migration failed: %v", err)
	}
	log.Println("Database migration completed.")
}
