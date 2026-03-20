package models

import (
	"time"

	"gorm.io/gorm"
)

type Employee struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	FirstName   string         `gorm:"size:100;not null" json:"first_name"`
	LastName    string         `gorm:"size:100;not null" json:"last_name"`
	Email       string         `gorm:"size:100;unique;not null" json:"email"`
	Position    string         `gorm:"size:100" json:"position"`
	DepartmentID uint          `json:"department_id"`
	Department  Department     `gorm:"foreignKey:DepartmentID" json:"department"`
	Salary                float64        `gorm:"type:decimal(10,2)" json:"salary"`
	DateHired             time.Time      `json:"date_hired"`
	AccountNumber         string         `gorm:"size:20" json:"account_number"`
	BankCode              string         `gorm:"size:10" json:"bank_code"`
	BankName              string         `gorm:"size:100" json:"bank_name"`
	PaystackRecipientCode string         `gorm:"size:50" json:"paystack_recipient_code"`
	CreatedAt             time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}
