package models

import (
	"time"

	"gorm.io/gorm"
)

type Payroll struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	EmployeeID    uint           `gorm:"not null" json:"employee_id"`
	Employee      Employee       `gorm:"foreignKey:EmployeeID" json:"employee"`
	PeriodStart   time.Time      `json:"period_start"`
	PeriodEnd     time.Time      `json:"period_end"`
	BasicSalary   float64        `gorm:"type:decimal(10,2)" json:"basic_salary"`
	Allowances    float64        `gorm:"type:decimal(10,2)" json:"allowances"`
	Deductions    float64        `gorm:"type:decimal(10,2)" json:"deductions"`
	Tax           float64        `gorm:"type:decimal(10,2)" json:"tax"`
	NetSalary     float64        `gorm:"type:decimal(10,2)" json:"net_salary"`
	PaymentStatus string         `gorm:"size:50;default:'pending'" json:"payment_status"`
	AbsenceDays   float64        `gorm:"-" json:"absence_days"` // Calculated, not stored
	AbsenceDeduction float64     `gorm:"-" json:"absence_deduction"` // Calculated, not stored
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}
