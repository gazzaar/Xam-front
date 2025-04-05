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

// Exam services
export const examService = {
  createExam: async (examData) => {
    try {
      console.log('Creating exam with data:', examData);
      const response = await api.post('/instructor/exams', examData);
      console.log('Exam creation response:', response.data);
      return response.data;
    } catch (error) {
      console.error(
        'Exam creation error:',
        error.response?.data || error.message
      );
      throw (
        error.response?.data || {
          success: false,
          message: 'Network error occurred',
        }
      );
    }
  },

  updateExam: async (examId, examData) => {
    try {
      const response = await api.put(`/instructor/exams/${examId}`, examData);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to update exam';
      throw {
        ...error.response?.data,
        message: errorMessage,
      };
    }
  },

  deleteExam: async (examId) => {
    try {
      const response = await api.delete(`/instructor/exams/${examId}`);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to delete exam';
      throw {
        ...error.response?.data,
        message: errorMessage,
      };
    }
  },

  getExams: async () => {
    try {
      const response = await api.get('/instructor/exams');
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

  addQuestions: async (examId, questions) => {
    try {
      const response = await api.post(`/instructor/exams/${examId}/questions`, {
        questions,
      });
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

  uploadStudents: async (examId, file) => {
    try {
      const formData = new FormData();
      formData.append('students', file);

      const response = await api.post(
        `/instructor/exams/${examId}/students/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Upload error:', error.response?.data || error.message);
      throw (
        error.response?.data || {
          success: false,
          message: 'Failed to upload student list',
        }
      );
    }
  },

  getExamResults: async (examId) => {
    try {
      const response = await api.get(`/instructor/exams/${examId}/results`);
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

// Student exam services
export const studentExamService = {
  validateAccess: async (accessCode) => {
    try {
      const response = await api.post('/exam/validate-access', { accessCode });
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

  startExam: async (examId) => {
    try {
      const response = await api.post('/exam/start', { examId });
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

  submitAnswer: async (attemptId, questionId, answer) => {
    try {
      const response = await api.post('/exam/answer', {
        attemptId,
        questionId,
        answer,
      });
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

  finishExam: async (attemptId) => {
    try {
      const response = await api.post(`/exam/${attemptId}/finish`);
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
