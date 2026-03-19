const BASE_URL = 'http://localhost:3000';

const apiRequest = async (endpoint, method = 'GET', body = null) => {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Something went wrong');
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
    getMyPayrolls: (employeeId) => apiRequest(`/api/payrolls/employee/${employeeId}`),
};
