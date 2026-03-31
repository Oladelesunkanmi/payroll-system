package paystack

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
)

type RecipientRequest struct {
	Type          string `json:"type"` // "nuban"
	Name          string `json:"name"`
	AccountNumber string `json:"account_number"`
	BankCode      string `json:"bank_code"`
	Currency      string `json:"currency"` // "NGN"
}

type BulkTransferItem struct {
	Amount    int    `json:"amount"` // in kobo
	Recipient string `json:"recipient"`
}

type BulkTransferRequest struct {
	Source    string             `json:"source"` // "balance"
	Transfers []BulkTransferItem `json:"transfers"`
}

func CreateTransferRecipient(name, accNumber, bankCode string) (string, error) {
	apiKey := os.Getenv("PAYSTACK_SECRET_KEY")
	url := "https://api.paystack.co/transferrecipient"

	reqBody := RecipientRequest{
		Type:          "nuban",
		Name:          name,
		AccountNumber: accNumber,
		BankCode:      bankCode,
		Currency:      "NGN",
	}

	jsonBody, _ := json.Marshal(reqBody)
	req, _ := http.NewRequest("POST", url, bytes.NewBuffer(jsonBody))
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	if data, ok := result["data"].(map[string]interface{}); ok {
		return data["recipient_code"].(string), nil
	}

	return "", fmt.Errorf("failed to create recipient: %v", result["message"])
}

func InitiateBulkTransfer(items []BulkTransferItem) (string, error) {
	apiKey := os.Getenv("PAYSTACK_SECRET_KEY")
	url := "https://api.paystack.co/transfer/bulk"

	reqBody := BulkTransferRequest{
		Source:    "balance",
		Transfers: items,
	}

	jsonBody, _ := json.Marshal(reqBody)
	req, _ := http.NewRequest("POST", url, bytes.NewBuffer(jsonBody))
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	if status, ok := result["status"].(bool); ok && status {
		return "Transfer initiated", nil
	}

	return "", fmt.Errorf("failed to initiate transfer: %v", result["message"])
}
