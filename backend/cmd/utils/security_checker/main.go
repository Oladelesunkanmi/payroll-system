package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

func main() {
	baseURL := "http://localhost:3000"

	// 1. Unauthenticated test
	fmt.Println("--- Test 1/4: Unauthenticated access to /api/employees ---")
	resp, _ := http.Get(baseURL + "/api/employees")
	fmt.Printf("Status: %d (Expected: 401)\n", resp.StatusCode)

	// 2. Login as Admin
	fmt.Println("\n--- Logging in as Admin ---")
	loginData, _ := json.Marshal(map[string]string{
		"email":    "admin@payrollpro.com",
		"password": "admin123",
	})
	resp, _ = http.Post(baseURL+"/auth/login", "application/json", bytes.NewBuffer(loginData))
	var loginResult struct {
		Token      string `json:"token"`
		EmployeeID *uint  `json:"employee_id"`
	}
	body, _ := io.ReadAll(resp.Body)
	json.Unmarshal(body, &loginResult)
	adminToken := loginResult.Token
	fmt.Printf("Login Status: %d\n", resp.StatusCode)

	// 3. Admin access to sensitive routes
	fmt.Println("\n--- Test 2/4: Admin access to /api/employees ---")
	req, _ := http.NewRequest("GET", baseURL+"/api/employees", nil)
	req.Header.Set("Authorization", "Bearer "+adminToken)
	resp, _ = http.DefaultClient.Do(req)
	fmt.Printf("Status: %d (Expected: 200)\n", resp.StatusCode)

	// 4. Create a regular user and test access
	fmt.Println("\n--- Test 3/4: Regular user RBAC (Accessing /api/employees) ---")
	signupData, _ := json.Marshal(map[string]string{
		"username": "tester_" + fmt.Sprintf("%s", loginResult.Token[len(loginResult.Token)-5:]), // Unique
		"email":    "tester_new@example.com",
		"password": "password123",
	})
	// Just use existing tester if signup fails
	http.Post(baseURL+"/auth/signup", "application/json", bytes.NewBuffer(signupData))
	
	loginData, _ = json.Marshal(map[string]string{
		"email":    "tester@example.com",
		"password": "password123",
	})
	resp, _ = http.Post(baseURL+"/auth/login", "application/json", bytes.NewBuffer(loginData))
	body, _ = io.ReadAll(resp.Body)
	json.Unmarshal(body, &loginResult)
	userToken := loginResult.Token

	fmt.Println("User Login Status:", resp.StatusCode)

	req, _ = http.NewRequest("GET", baseURL+"/api/employees", nil)
	req.Header.Set("Authorization", "Bearer "+userToken)
	resp, _ = http.DefaultClient.Do(req)
	fmt.Printf("Status: %d (Expected: 403)\n", resp.StatusCode)

	// 5. Test Ownership (Accessing someone else's payroll)
	fmt.Println("\n--- Test 4/4: Ownership (Accessing /api/payrolls/employee/1 as test user) ---")
	req, _ = http.NewRequest("GET", baseURL+"/api/payrolls/employee/1", nil)
	req.Header.Set("Authorization", "Bearer "+userToken)
	resp, _ = http.DefaultClient.Do(req)
	fmt.Printf("Status: %d (Expected: 403)\n", resp.StatusCode)
}
