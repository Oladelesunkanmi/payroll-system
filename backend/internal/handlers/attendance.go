package handlers

import (
	"fmt"
	"time"

	"github.com/Oladelesunkanmi/payroll-system/backend/internal/models"
	"github.com/Oladelesunkanmi/payroll-system/backend/pkg/database"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm/clause"
)

// GetAttendance gets attendance records for a specific date
func GetAttendance(c *fiber.Ctx) error {
	dateStr := c.Query("date")
	if dateStr == "" {
		dateStr = time.Now().Format("2006-01-02")
	}

	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"message": "Invalid date format. Use YYYY-MM-DD"})
	}

	var records []models.Attendance
	database.DB.Preload("Employee.Department").Preload("MarkedBy").Where("date = ?", date).Find(&records)

	// We also want to return the list of all active employees so the frontend can
	// display everyone, even if they don't have a record for this date yet.
	var employees []models.Employee
	database.DB.Preload("Department").Find(&employees)

	// Map existing records
	recordMap := make(map[uint]models.Attendance)
	for _, r := range records {
		recordMap[r.EmployeeID] = r
	}

	// Create response payload
	type AttendanceResponse struct {
		EmployeeID uint   `json:"employee_id"`
		FirstName  string `json:"first_name"`
		LastName   string `json:"last_name"`
		Department string `json:"department"`
		Status     string `json:"status"`
		Note       string `json:"note"`
		MarkedBy   string `json:"marked_by"`
	}

	var response []AttendanceResponse
	for _, emp := range employees {
		status := "Present"
		note := ""
		markedBy := ""

		if r, ok := recordMap[emp.ID]; ok {
			status = r.Status
			note = r.Note
			if r.MarkedBy.Username != "" {
				markedBy = r.MarkedBy.Username
			}
		}

		deptName := "Unassigned"
		if emp.Department.Name != "" {
			deptName = emp.Department.Name
		}

		response = append(response, AttendanceResponse{
			EmployeeID: emp.ID,
			FirstName:  emp.FirstName,
			LastName:   emp.LastName,
			Department: deptName,
			Status:     status,
			Note:       note,
			MarkedBy:   markedBy,
		})
	}

	return c.JSON(response)
}

// MarkAttendance requests
type MarkAttendanceRequest struct {
	EmployeeID uint   `json:"employee_id"`
	Date       string `json:"date"`
	Status     string `json:"status"` // Present, Absent, Leave, Half Day
	Note       string `json:"note"`
}

// MarkAttendance creates or updates a single attendance record
func MarkAttendance(c *fiber.Ctx) error {
	var req MarkAttendanceRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"message": err.Error()})
	}

	date, err := time.Parse("2006-01-02", req.Date)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"message": "Invalid date format. Use YYYY-MM-DD"})
	}

	userID := c.Locals("user_id").(uint)

	// Update or Create
	attendance := models.Attendance{
		EmployeeID: req.EmployeeID,
		Date:       date,
		Status:     req.Status,
		Note:       req.Note,
		MarkedByID: userID,
	}

	// Upsert based on EmployeeID and Date
	result := database.DB.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "employee_id"}, {Name: "date"}},
		DoUpdates: clause.AssignmentColumns([]string{"status", "note", "marked_by_id", "updated_at"}),
	}).Create(&attendance)

	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"message": result.Error.Error()})
	}

	return c.JSON(fiber.Map{"message": "Attendance marked successfully"})
}

// BulkMarkAttendanceRequest
type BulkMarkAttendanceRequest struct {
	Date    string                  `json:"date"`
	Records []MarkAttendanceRequest `json:"records"`
}

// BulkMarkAttendance updates multiple records at once
func BulkMarkAttendance(c *fiber.Ctx) error {
	var req BulkMarkAttendanceRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"message": err.Error()})
	}

	date, err := time.Parse("2006-01-02", req.Date)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"message": "Invalid date format. Use YYYY-MM-DD"})
	}

	userID := c.Locals("user_id").(uint)

	var attendances []models.Attendance
	for _, r := range req.Records {
		attendances = append(attendances, models.Attendance{
			EmployeeID: r.EmployeeID,
			Date:       date,
			Status:     r.Status,
			Note:       r.Note,
			MarkedByID: userID,
		})
	}

	if len(attendances) > 0 {
		result := database.DB.Clauses(clause.OnConflict{
			Columns:   []clause.Column{{Name: "employee_id"}, {Name: "date"}},
			DoUpdates: clause.AssignmentColumns([]string{"status", "note", "marked_by_id", "updated_at"}),
		}).Create(&attendances)

		if result.Error != nil {
			return c.Status(500).JSON(fiber.Map{"message": result.Error.Error()})
		}
	}

	return c.JSON(fiber.Map{"message": fmt.Sprintf("Successfully marked attendance for %d employees", len(attendances))})
}

// GetEmployeeMonthlyAttendance gets a specific employee's attendance for a given month
func GetEmployeeMonthlyAttendance(c *fiber.Ctx) error {
	empID := c.Params("id")
	monthStr := c.Query("month") // 1-12
	yearStr := c.Query("year")   // YYYY

	if monthStr == "" || yearStr == "" {
		now := time.Now()
		monthStr = fmt.Sprintf("%d", now.Month())
		yearStr = fmt.Sprintf("%d", now.Year())
	}

	var records []models.Attendance
	query := `
		SELECT * FROM attendances 
		WHERE employee_id = ? 
		AND EXTRACT(MONTH FROM date) = ? 
		AND EXTRACT(YEAR FROM date) = ?
		ORDER BY date ASC
	`
	database.DB.Raw(query, empID, monthStr, yearStr).Scan(&records)

	return c.JSON(records)
}

// GetAttendanceSummary gets summary info for deductions
func GetAttendanceSummary(c *fiber.Ctx) error {
	empID := c.Params("id")
	startStr := c.Query("start")
	endStr := c.Query("end")

	if startStr == "" || endStr == "" {
		return c.Status(400).JSON(fiber.Map{"message": "Start and end dates are required"})
	}

	start, err1 := time.Parse("2006-01-02", startStr)
	end, err2 := time.Parse("2006-01-02", endStr)

	if err1 != nil || err2 != nil {
		return c.Status(400).JSON(fiber.Map{"message": "Invalid date format"})
	}

	var records []models.Attendance
	database.DB.Where("employee_id = ? AND date >= ? AND date <= ?", empID, start, end).Find(&records)

	present := 0
	absent := 0
	leave := 0
	halfDay := 0

	for _, r := range records {
		switch r.Status {
		case "Present":
			present++
		case "Absent":
			absent++
		case "Leave":
			leave++
		case "Half Day":
			halfDay++
		}
	}

	return c.JSON(fiber.Map{
		"present":  present,
		"absent":   absent,
		"leave":    leave,
		"half_day": halfDay,
		"total":    len(records),
	})
}
