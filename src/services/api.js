import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          success: false,
          message: 'Network error occurred',
        }
      );
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/auth/register/instructor', userData);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          success: false,
          message: 'Network error occurred',
        }
      );
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

// Admin services
export const adminService = {
  getDashboardStats: async () => {
    try {
      const response = await api.get('/admin/dashboard');
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          success: false,
          message: 'Network error occurred',
        }
      );
    }
  },

  getInstructors: async () => {
    try {
      const response = await api.get('/admin/instructors');
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          success: false,
          message: 'Network error occurred',
        }
      );
    }
  },

  getPendingInstructors: async () => {
    try {
      const response = await api.get('/admin/instructors/pending');
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          success: false,
          message: 'Network error occurred',
        }
      );
    }
  },

  approveInstructor: async (instructorId) => {
    try {
      const response = await api.put(
        `/admin/instructors/${instructorId}/approve`
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          success: false,
          message: 'Network error occurred',
        }
      );
    }
  },
};
