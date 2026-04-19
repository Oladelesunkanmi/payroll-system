package models

import (
	"time"

	"gorm.io/gorm"
)

type Attendance struct {
	ID         uint           `gorm:"primaryKey" json:"id"`
	EmployeeID uint           `gorm:"not null;uniqueIndex:idx_employee_date" json:"employee_id"`
	Employee   Employee       `gorm:"foreignKey:EmployeeID" json:"employee"`
	Date       time.Time      `gorm:"type:date;not null;uniqueIndex:idx_employee_date" json:"date"`
	Status     string         `gorm:"size:20;not null" json:"status"` // Present, Absent, Leave, Half Day
	Note       string         `gorm:"size:255" json:"note"`
	MarkedByID uint           `json:"marked_by_id"`
	MarkedBy   User           `gorm:"foreignKey:MarkedByID" json:"marked_by"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
}
