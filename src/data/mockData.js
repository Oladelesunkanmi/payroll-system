export const employees = [
    { id: 'EMP001', name: 'Sarah Johnson', email: 'sarah.johnson@company.com', department: 'Engineering', position: 'Senior Developer', salary: 95000, status: 'Active', hireDate: '2021-03-15', avatar: null },
    { id: 'EMP002', name: 'Michael Chen', email: 'michael.chen@company.com', department: 'Engineering', position: 'Tech Lead', salary: 115000, status: 'Active', hireDate: '2020-07-22', avatar: null },
    { id: 'EMP003', name: 'Emily Davis', email: 'emily.davis@company.com', department: 'Marketing', position: 'Marketing Manager', salary: 82000, status: 'Active', hireDate: '2022-01-10', avatar: null },
    { id: 'EMP004', name: 'James Wilson', email: 'james.wilson@company.com', department: 'Finance', position: 'Financial Analyst', salary: 78000, status: 'Active', hireDate: '2021-11-05', avatar: null },
    { id: 'EMP005', name: 'Jessica Brown', email: 'jessica.brown@company.com', department: 'HR', position: 'HR Specialist', salary: 68000, status: 'Active', hireDate: '2023-02-14', avatar: null },
    { id: 'EMP006', name: 'David Martinez', email: 'david.martinez@company.com', department: 'Engineering', position: 'Junior Developer', salary: 65000, status: 'Active', hireDate: '2023-06-01', avatar: null },
    { id: 'EMP007', name: 'Amanda Taylor', email: 'amanda.taylor@company.com', department: 'Sales', position: 'Sales Executive', salary: 72000, status: 'Active', hireDate: '2022-04-18', avatar: null },
    { id: 'EMP008', name: 'Robert Garcia', email: 'robert.garcia@company.com', department: 'Engineering', position: 'DevOps Engineer', salary: 98000, status: 'Active', hireDate: '2021-09-30', avatar: null },
    { id: 'EMP009', name: 'Lisa Anderson', email: 'lisa.anderson@company.com', department: 'Marketing', position: 'Content Specialist', salary: 62000, status: 'On Leave', hireDate: '2022-08-12', avatar: null },
    { id: 'EMP010', name: 'Chris Thomas', email: 'chris.thomas@company.com', department: 'Finance', position: 'Accountant', salary: 70000, status: 'Active', hireDate: '2023-01-20', avatar: null },
    { id: 'EMP011', name: 'Sophia Lee', email: 'sophia.lee@company.com', department: 'Engineering', position: 'QA Engineer', salary: 75000, status: 'Active', hireDate: '2022-05-25', avatar: null },
    { id: 'EMP012', name: 'Daniel Kim', email: 'daniel.kim@company.com', department: 'Sales', position: 'Sales Manager', salary: 88000, status: 'Active', hireDate: '2020-12-01', avatar: null },
    { id: 'EMP013', name: 'Rachel White', email: 'rachel.white@company.com', department: 'HR', position: 'HR Manager', salary: 85000, status: 'Active', hireDate: '2021-06-15', avatar: null },
    { id: 'EMP014', name: 'Kevin Wright', email: 'kevin.wright@company.com', department: 'Marketing', position: 'SEO Specialist', salary: 64000, status: 'Inactive', hireDate: '2022-10-08', avatar: null },
    { id: 'EMP015', name: 'Maria Lopez', email: 'maria.lopez@company.com', department: 'Finance', position: 'Finance Manager', salary: 105000, status: 'Active', hireDate: '2020-03-20', avatar: null },
    { id: 'EMP016', name: 'Andrew Hall', email: 'andrew.hall@company.com', department: 'Engineering', position: 'Full Stack Developer', salary: 92000, status: 'Active', hireDate: '2021-08-10', avatar: null },
];

export const departments = ['Engineering', 'Marketing', 'Finance', 'HR', 'Sales'];

export const payrollRecords = [
    { id: 'PAY001', employeeId: 'EMP001', employeeName: 'Sarah Johnson', department: 'Engineering', baseSalary: 7916.67, bonus: 500, deductions: 1200, netPay: 7216.67, month: 'March 2026', status: 'Processed' },
    { id: 'PAY002', employeeId: 'EMP002', employeeName: 'Michael Chen', department: 'Engineering', baseSalary: 9583.33, bonus: 800, deductions: 1500, netPay: 8883.33, month: 'March 2026', status: 'Processed' },
    { id: 'PAY003', employeeId: 'EMP003', employeeName: 'Emily Davis', department: 'Marketing', baseSalary: 6833.33, bonus: 300, deductions: 1000, netPay: 6133.33, month: 'March 2026', status: 'Pending' },
    { id: 'PAY004', employeeId: 'EMP004', employeeName: 'James Wilson', department: 'Finance', baseSalary: 6500.00, bonus: 200, deductions: 950, netPay: 5750.00, month: 'March 2026', status: 'Processed' },
    { id: 'PAY005', employeeId: 'EMP005', employeeName: 'Jessica Brown', department: 'HR', baseSalary: 5666.67, bonus: 150, deductions: 850, netPay: 4966.67, month: 'March 2026', status: 'Pending' },
    { id: 'PAY006', employeeId: 'EMP006', employeeName: 'David Martinez', department: 'Engineering', baseSalary: 5416.67, bonus: 100, deductions: 800, netPay: 4716.67, month: 'March 2026', status: 'Processed' },
    { id: 'PAY007', employeeId: 'EMP007', employeeName: 'Amanda Taylor', department: 'Sales', baseSalary: 6000.00, bonus: 600, deductions: 900, netPay: 5700.00, month: 'March 2026', status: 'Processed' },
    { id: 'PAY008', employeeId: 'EMP008', employeeName: 'Robert Garcia', department: 'Engineering', baseSalary: 8166.67, bonus: 400, deductions: 1250, netPay: 7316.67, month: 'March 2026', status: 'Pending' },
    { id: 'PAY009', employeeId: 'EMP009', employeeName: 'Lisa Anderson', department: 'Marketing', baseSalary: 5166.67, bonus: 0, deductions: 780, netPay: 4386.67, month: 'March 2026', status: 'Processed' },
    { id: 'PAY010', employeeId: 'EMP010', employeeName: 'Chris Thomas', department: 'Finance', baseSalary: 5833.33, bonus: 250, deductions: 880, netPay: 5203.33, month: 'March 2026', status: 'Processed' },
];

export const payslipHistory = [
    { id: 'PS001', month: 'March 2026', basicSalary: 7916.67, allowances: 800, deductions: 1200, netSalary: 7516.67, status: 'Paid', paidDate: '2026-03-01' },
    { id: 'PS002', month: 'February 2026', basicSalary: 7916.67, allowances: 600, deductions: 1200, netSalary: 7316.67, status: 'Paid', paidDate: '2026-02-01' },
    { id: 'PS003', month: 'January 2026', basicSalary: 7916.67, allowances: 500, deductions: 1200, netSalary: 7216.67, status: 'Paid', paidDate: '2026-01-01' },
    { id: 'PS004', month: 'December 2025', basicSalary: 7500.00, allowances: 1500, deductions: 1150, netSalary: 7850.00, status: 'Paid', paidDate: '2025-12-01' },
    { id: 'PS005', month: 'November 2025', basicSalary: 7500.00, allowances: 500, deductions: 1150, netSalary: 6850.00, status: 'Paid', paidDate: '2025-11-01' },
    { id: 'PS006', month: 'October 2025', basicSalary: 7500.00, allowances: 500, deductions: 1150, netSalary: 6850.00, status: 'Paid', paidDate: '2025-10-01' },
];

export const monthlyExpenses = {
    labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    data: [485000, 492000, 528000, 501000, 510000, 523000],
};

export const departmentDistribution = {
    labels: ['Engineering', 'Marketing', 'Finance', 'HR', 'Sales'],
    data: [6, 3, 3, 2, 2],
    colors: ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'],
};

export const departmentSalarySummary = [
    { department: 'Engineering', employees: 6, totalSalary: 540000, avgSalary: 90000 },
    { department: 'Marketing', employees: 3, totalSalary: 208000, avgSalary: 69333 },
    { department: 'Finance', employees: 3, totalSalary: 253000, avgSalary: 84333 },
    { department: 'HR', employees: 2, totalSalary: 153000, avgSalary: 76500 },
    { department: 'Sales', employees: 2, totalSalary: 160000, avgSalary: 80000 },
];

export const demoUsers = [
    { email: 'admin@payrollpro.com', password: 'admin123', name: 'Admin User', role: 'admin', avatar: null },
    { email: 'hr@payrollpro.com', password: 'hr123', name: 'HR Manager', role: 'hr', avatar: null },
    { email: 'sarah.johnson@company.com', password: 'emp123', name: 'Sarah Johnson', role: 'employee', avatar: null },
];
