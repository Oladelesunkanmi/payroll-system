package main

import (
	"log"
	"github.com/Oladelesunkanmi/payroll-system/backend/pkg/database"
)

func main() {
	database.ConnectDB()
	database.DB.Exec("DELETE FROM attendances")
	database.DB.Exec("DELETE FROM payrolls")
	database.DB.Exec("DELETE FROM employees")
	log.Println("Database cleaned successfully")
}
