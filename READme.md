# 🇳🇬 Nigerian Payroll System (Paystack Integrated)

A modern, robust payroll management system tailored for the Nigerian market, featuring automated payroll generation, Naira (₦) localization, and seamless Paystack integration for bulk salary disbursements.

## ✨ Core Features

- **📊 Dashboard & Analytics**: Live visualization of payroll expenses, department distributions, and processing status.
- **👥 Employee Management**: Full CRUD operations for employee records, including department-based filtering and bank detail management.
- **🏦 Department Management**: Dedicated portal to manage company departments and organizational structure.
- **💰 Automated Payroll**: 
    - Intelligent auto-generation of monthly payroll records for all active employees.
    - Real-time bonus (allowance) and deduction calculations with instant Net Pay feedback.
- **💳 Paystack Bulk Transfer (Integrated)**: 
    - One-click bulk salary disbursement via the Paystack API.
    - Automated creation of Transfer Recipients.
    - Status tracking for every disbursement.

## 🛠️ Tech Stack

### Backend
- **Language**: Go (Golang)
- **Framework**: [Fiber](https://gofiber.io/) - High-performance web framework.
- **Database**: PostgreSQL with [GORM](https://gorm.io/) (Automated migrations).
- **Security**: Bcrypt password hashing & JWT authentication (under development).

### Frontend
- **Framework**: React (Vite-powered)
- **Styling**: Tailwind CSS (Premium dashboard aesthetics).
- **Icons**: Lucide-React.
- **Charts**: Chart.js with React-Chartjs-2.

## 🚀 Getting Started

### Prerequisites
- Go 1.25+
- Node.js 18+
- PostgreSQL database

### Environment Setup
Create a `.env` file in the `backend/` directory:
```env
PORT=3000
DB_URL=postgres://user:pass@localhost:5432/payroll_db
JWT_SECRET=your_super_secret_key
PAYSTACK_SECRET_KEY=sk_test_...
```

### Installation

1. **Backend**:
   ```bash
   cd backend
   go mod tidy
   go run cmd/api/main.go
   ```

2. **Frontend**:
   ```bash
   npm install
   npm run dev
   ```

## 🏦 Paystack Integration Guide

To enable bulk payments:
1. Obtain your **Secret Key** from the Paystack Dashboard.
2. Disable the **Transfer OTP** requirement in your Paystack settings (required for API-driven bulk transfers).
3. Ensure employees have valid **Account Numbers** and **Bank Codes** in their profiles.
4. Click **"Process via Paystack"** in the Payroll dashboard to initiate disbursement.

## 📜 License
MIT License. Created by Oladelesunkanmi.
