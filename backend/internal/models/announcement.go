package models

import (
	"time"
	"gorm.io/gorm"
)

type Announcement struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	Title        string         `gorm:"size:255;not null" json:"title"`
	Content      string         `gorm:"type:text;not null" json:"content"`
	TargetType   string         `gorm:"size:20;default:'All'" json:"target_type"` // 'All' or 'Department'
	DepartmentID *uint          `json:"department_id"`
	Department   *Department    `gorm:"foreignKey:DepartmentID" json:"department"`
	SenderID     uint           `json:"sender_id"`
	Sender       User           `gorm:"foreignKey:SenderID" json:"sender"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}
