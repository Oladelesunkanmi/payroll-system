package models

import (
	"time"

	"gorm.io/gorm"
)

type Activity struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Action    string         `gorm:"size:255;not null" json:"action"`
	Category  string         `gorm:"size:100;not null" json:"category"` // employees, payroll, auth, etc.
	Details   string         `gorm:"type:text" json:"details"`
	Icon      string         `gorm:"size:50" json:"icon"`  // Tailwind/Lucide icon name
	Color     string         `gorm:"size:50" json:"color"` // Tailwind color class
	Read      bool           `gorm:"default:false" json:"read"`
	UserID    uint           `json:"user_id"`
	User      User           `gorm:"foreignKey:UserID" json:"user"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}
