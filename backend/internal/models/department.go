package models

import (
	"time"

	"gorm.io/gorm"
)

type Department struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Name      string         `gorm:"size:100;unique;not null" json:"name"`
	ManagerID *uint          `json:"manager_id"`
	Employees []Employee     `gorm:"foreignKey:DepartmentID" json:"employees"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}
