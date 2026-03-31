package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {
	resp, err := http.Get("http://localhost:3000/api/stats/activity")
	if err != nil {
		fmt.Printf("Error: %v\n", err)
		return
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	fmt.Printf("Status: %d\nBody: %s\n", resp.StatusCode)
}
