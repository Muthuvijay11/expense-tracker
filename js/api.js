// SpendWise REST API Client
const API_BASE = window.location.origin.includes(':5500') || window.location.origin.includes(':3000')
  ? 'http://localhost:8080/api'
  : '/api';

class ApiClient {
  constructor() {
    this.tokenKey = 'spendwise_token';
    this.userKey = 'spendwise_user';
  }

  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token) {
    if (token) {
      localStorage.setItem(this.tokenKey, token);
    } else {
      localStorage.removeItem(this.tokenKey);
    }
  }

  getCurrentUser() {
    try {
      const data = localStorage.getItem(this.userKey);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  setCurrentUser(user) {
    if (user) {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.userKey);
    }
  }

  clearAuth() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers || {})
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      // Handle 401 Unauthorized
      if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
        this.clearAuth();
        window.dispatchEvent(new CustomEvent('auth:expired'));
        throw new Error('Your session has expired. Please sign in again.');
      }

      // Handle CSV downloads or non-JSON responses
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/csv')) {
        return await response.blob();
      }

      const data = await response.json();
      if (!response.ok) {
        let msg = data.error || data.message || `Request failed (${response.status})`;
        if (data.fieldErrors) {
          const details = Object.values(data.fieldErrors).join(', ');
          msg = `${msg}: ${details}`;
        }
        throw new Error(msg);
      }

      return data.data !== undefined ? data.data : data;
    } catch (error) {
      if (!navigator.onLine) {
        window.dispatchEvent(new CustomEvent('network:offline'));
        throw new Error('Network offline: Unable to complete request. Please reconnect.');
      }
      throw error;
    }
  }

  // Auth Endpoints
  async register(username, email, password, fullName, currency = 'USD') {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, fullName, currency })
    });
    this.setToken(data.token);
    this.setCurrentUser(data);
    return data;
  }

  async login(usernameOrEmail, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ usernameOrEmail, password })
    });
    this.setToken(data.token);
    this.setCurrentUser(data);
    return data;
  }

  async logout() {
    try {
      if (this.isAuthenticated()) {
        await this.request('/auth/logout', { method: 'POST' });
      }
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      this.clearAuth();
    }
  }

  async getMe() {
    const data = await this.request('/auth/me');
    this.setCurrentUser(data);
    return data;
  }

  // Transactions Endpoints
  async getTransactions(params = {}) {
    const query = new URLSearchParams();
    if (params.type && params.type !== 'all') query.append('type', params.type.toUpperCase());
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);
    if (params.search) query.append('search', params.search);
    if (params.page !== undefined) query.append('page', params.page);
    if (params.size !== undefined) query.append('size', params.size);

    const qs = query.toString();
    return await this.request(`/transactions${qs ? '?' + qs : ''}`);
  }

  async getAllTransactions() {
    return await this.request('/transactions/all');
  }

  async getTransactionById(id) {
    return await this.request(`/transactions/${id}`);
  }

  async createTransaction(tx) {
    return await this.request('/transactions', {
      method: 'POST',
      body: JSON.stringify(tx)
    });
  }

  async updateTransaction(id, tx) {
    return await this.request(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tx)
    });
  }

  async deleteTransaction(id) {
    return await this.request(`/transactions/${id}`, {
      method: 'DELETE'
    });
  }

  async downloadCsv(params = {}) {
    const query = new URLSearchParams();
    if (params.type && params.type !== 'all') query.append('type', params.type.toUpperCase());
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);

    const qs = query.toString();
    const blob = await this.request(`/transactions/export/csv${qs ? '?' + qs : ''}`);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spendwise-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Budgets Endpoints
  async getBudgets() {
    return await this.request('/budgets');
  }

  async setBudget(categoryId, monthlyLimit) {
    return await this.request('/budgets', {
      method: 'POST',
      body: JSON.stringify({ categoryId, monthlyLimit })
    });
  }

  async setBatchBudgets(budgetMap) {
    return await this.request('/budgets/batch', {
      method: 'PUT',
      body: JSON.stringify(budgetMap)
    });
  }

  async deleteBudget(categoryId) {
    return await this.request(`/budgets/${categoryId}`, {
      method: 'DELETE'
    });
  }

  // Reports Endpoints
  async getDashboardSummary() {
    return await this.request('/reports/dashboard');
  }

  async getPeriodReport(periodType = 'WEEKLY') {
    return await this.request(`/reports/period?type=${periodType.toUpperCase()}`);
  }

  async getCategoryBreakdown() {
    return await this.request('/reports/category-breakdown');
  }

  // User Endpoints
  async updateCurrency(currency) {
    return await this.request('/users/currency', {
      method: 'PUT',
      body: JSON.stringify({ currency })
    });
  }
}

const api = new ApiClient();
window.api = api;
