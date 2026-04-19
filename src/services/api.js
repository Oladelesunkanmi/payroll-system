const BASE_URL = 'http://localhost:3000';

const apiRequest = async (endpoint, method = 'GET', body = null) => {
    const token = localStorage.getItem('payroll_token');
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        },
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    if (!response.ok) {
        let message = 'Something went wrong';

        try {
            const error = await response.json();
            message = error.message || message;
        } catch {
            // ignore JSON parse errors
        }

        if (response.status === 401) {
            if (
                message === 'Invalid or expired token' ||
                message === 'Missing authorization header' ||
                message === 'Invalid authorization header format'
            ) {
                localStorage.removeItem('payroll_token');
                localStorage.removeItem('payroll_user');
                window.location.href = '/login';
            }
        }

        throw new Error(message);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
};

export const api = {
    // Auth
    login: (credentials) => apiRequest('/auth/login', 'POST', credentials),
    signup: (data) => apiRequest('/auth/signup', 'POST', data),

    // Employees
    getEmployees: () => apiRequest('/api/employees'),
    getEmployee: (id) => apiRequest(`/api/employees/${id}`),
    createEmployee: (data) => apiRequest('/api/employees', 'POST', data),
    updateEmployee: (id, data) => apiRequest(`/api/employees/${id}`, 'PUT', data),
    deleteEmployee: (id) => apiRequest(`/api/employees/${id}`, 'DELETE'),

    // Payrolls
    getPayrolls: () => apiRequest('/api/payrolls'),
    getPayroll: (id) => apiRequest(`/api/payrolls/${id}`),
    createPayroll: (data) => apiRequest('/api/payrolls', 'POST', data),
    updatePayroll: (id, data) => apiRequest(`/api/payrolls/${id}`, 'PUT', data),
    deletePayroll: (id) => apiRequest(`/api/payrolls/${id}`, 'DELETE'),

    // Departments
    getDepartments: () => apiRequest('/api/departments'),
    getDepartment: (id) => apiRequest(`/api/departments/${id}`),
    createDepartment: (data) => apiRequest('/api/departments', 'POST', data),
    updateDepartment: (id, data) => apiRequest(`/api/departments/${id}`, 'PUT', data),
    deleteDepartment: (id) => apiRequest(`/api/departments/${id}`, 'DELETE'),

    // Stats & Reports
    getDashboardStats: () => apiRequest('/api/stats/dashboard'),
    getReportsData: () => apiRequest('/api/stats/reports'),
    getRecentActivity: () => apiRequest('/api/stats/activity'),
    getNotifications: () => apiRequest('/api/notifications'),
    markNotificationRead: (id) => apiRequest(`/api/notifications/read/${id}`, 'POST'),
    markAllNotificationsRead: () => apiRequest('/api/notifications/read-all', 'POST'),
    getMyPayrolls: (employeeId) => apiRequest(`/api/payrolls/employee/${employeeId}`),
    processBulkTransfer: () => apiRequest('/api/payrolls/bulk-transfer', 'POST'),

    // Attendance
    getAttendanceByDate: (date) => apiRequest(`/api/attendance?date=${date}`),
    markAttendance: (data) => apiRequest('/api/attendance', 'POST', data),
    bulkMarkAttendance: (data) => apiRequest('/api/attendance/bulk', 'POST', data),
    getEmployeeAttendance: (id, month, year) => apiRequest(`/api/attendance/employee/${id}?month=${month}&year=${year}`),
    getAttendanceSummary: (id, start, end) => apiRequest(`/api/attendance/summary/${id}?start=${start}&end=${end}`),
};
