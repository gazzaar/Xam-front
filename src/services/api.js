import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// Create axios instance with base config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth Service
const authService = {
  login: async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userRole', response.data.user.role);
        localStorage.setItem('userFirstName', response.data.user.first_name);
        localStorage.setItem('userLastName', response.data.user.last_name);
      }
      return {
        success: true,
        user: response.data.user,
        token: response.data.token,
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
  },

  registerInstructor: async (userData) => {
    try {
      const response = await api.post('/auth/register/instructor', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },
};

// Admin Service
const adminService = {
  getDashboardStats: async () => {
    try {
      const response = await api.get('/admin/dashboard');
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch dashboard stats'
      );
    }
  },

  getAllInstructors: async () => {
    try {
      const response = await api.get('/admin/instructors');
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch instructors'
      );
    }
  },

  getPendingInstructors: async () => {
    try {
      const response = await api.get('/admin/instructors/pending');
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch pending instructors'
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
      throw new Error(
        error.response?.data?.message || 'Failed to approve instructor'
      );
    }
  },

  deleteInstructor: async (instructorId) => {
    try {
      const response = await api.delete(`/admin/instructors/${instructorId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to delete instructor'
      );
    }
  },
};

// Instructor Service
const instructorService = {
  getDashboardStats: async () => {
    try {
      const response = await api.get('/instructor/dashboard');
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch dashboard stats'
      );
    }
  },

  createExam: async (examData) => {
    try {
      const response = await api.post('/instructor/exams', examData);
      return response.data ; // Wrap the response data to match expected format
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to create exam');
    }
  },

  getExams: async () => {
    try {
      const response = await api.get('/instructor/exams');
      console.log('Raw API response:', response.data);
      return response.data; // Return the data directly without wrapping
    } catch (error) {
      console.error('Error fetching exams:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch exams');
    }
  },

  getExamPreview: async (examId) => {
    try {
      const response = await api.get(`/instructor/exams/${examId}/preview`);
      console.log('Exam preview response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching exam preview:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch exam preview');
    }
  },

  updateExam: async (examId, examData) => {
    try {
      const response = await api.put(`/instructor/exams/${examId}`, examData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update exam');
    }
  },

  deleteExam: async (examId) => {
    try {
      const response = await api.delete(`/instructor/exams/${examId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting exam:', error);
      throw new Error(error.response?.data?.error || 'Failed to delete exam');
    }
  },

  addQuestionsToExam: async (examId, questions) => {
    try {
      const response = await api.post(`/instructor/exams/${examId}/questions`, {
        questions,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to add questions'
      );
    }
  },

  uploadAllowedStudents: async (examId, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file); // Changed to 'file' to match the multer field name in the route

      const response = await api.post(`/instructor/exams/${examId}/students/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error(
        error.response?.data?.error || 'Failed to upload student list'
      );
    }
  },

  getExamResults: async (examId) => {
    try {
      const response = await api.get(`/instructor/exams/${examId}/results`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch exam results'
      );
    }
  },

  // Course Management
  createCourse: async (courseData) => {
    try {
      const response = await api.post('/instructor/courses', courseData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to create course');
    }
  },

  getCourses: async () => {
    try {
      const response = await api.get('/instructor/courses');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch courses');
    }
  },

  updateCourse: async (courseId, courseData) => {
    try {
      const response = await api.put(`/instructor/courses/${courseId}`, courseData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to update course');
    }
  },

  deleteCourse: async (courseId) => {
    try {
      const response = await api.delete(`/instructor/courses/${courseId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to delete course');
    }
  },

  // Question Bank Management
  createQuestionBank: async (courseId, questionBankData) => {
    try {
      const response = await api.post('/instructor/question-banks', {
        course_id: courseId,
        ...questionBankData,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || 'Failed to create question bank'
      );
    }
  },

  getQuestionBanksByCourse: async (courseId) => {
    try {
      const response = await api.get('/instructor/question-banks', {
        params: { course_id: courseId },
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || 'Failed to fetch question banks'
      );
    }
  },

  updateQuestionBank: async (questionBankId, questionBankData) => {
    try {
      const response = await api.put(
        `/instructor/question-banks/${questionBankId}`,
        questionBankData
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || 'Failed to update question bank'
      );
    }
  },

  deleteQuestionBank: async (questionBankId) => {
    try {
      const response = await api.delete(`/instructor/question-banks/${questionBankId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || 'Failed to delete question bank'
      );
    }
  },

  addQuestionsToQuestionBank: async (questionBankId, questions) => {
    try {
      const response = await api.post(`/instructor/question-banks/${questionBankId}/questions`, { questions });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to add questions'
      );
    }
  },

  getQuestionsInQuestionBank: async (questionBankId) => {
    try {
      const response = await api.get(`/instructor/question-banks/${questionBankId}/questions`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch questions'
      );
    }
  },

  // Update question in question bank
  updateQuestionInQuestionBank: async (questionBankId, questionId, questionData) => {
    try {
      console.log('Updating question in bank:', questionBankId, 'Question ID:', questionId);
      const response = await api.put(`/instructor/question-banks/${questionBankId}/questions/${questionId}`, questionData);
      return response.data;
    } catch (error) {
      console.error('Error updating question in bank:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to update question'
      );
    }
  },

  // Delete question from question bank
  deleteQuestionFromQuestionBank: async (questionBankId, questionId) => {
    try {
      console.log('Deleting question from bank:', questionBankId, 'Question ID:', questionId);
      const response = await api.delete(`/instructor/question-banks/${questionBankId}/questions/${questionId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting question from bank:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to delete question'
      );
    }
  },

  // Update question
  updateQuestion: async (questionId, questionData) => {
    try {
      console.log('Updating question with data:', questionData);
      const response = await api.put(
        `/instructor/questions/${questionId}`,
        questionData
      );
      return response.data;
    } catch (error) {
      console.error('Error updating question:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to update question'
      );
    }
  },

  // Delete question
  deleteQuestion: async (questionId) => {
    try {
      console.log('Deleting question:', questionId);
      const response = await api.delete(`/instructor/questions/${questionId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting question:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to delete question'
      );
    }
  },
};

// Question Bank Service
const questionBankService = {
  getQuestions: async () => {
    try {
      const response = await api.get('/instructor/questions');
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch questions'
      );
    }
  },

  addQuestion: async (questionData) => {
    try {
      console.log('Adding question with data:', questionData);
      const response = await api.post('/instructor/questions', questionData);
      return response.data;
    } catch (error) {
      console.error('Error adding question:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to add question'
      );
    }
  },

  updateQuestion: async (questionId, questionData) => {
    try {
      console.log('Updating question with data:', questionData);
      const response = await api.put(
        `/instructor/questions/${questionId}`,
        questionData
      );
      return response.data;
    } catch (error) {
      console.error('Error updating question:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to update question'
      );
    }
  },

  deleteQuestion: async (questionId) => {
    try {
      const response = await api.delete(`/instructor/questions/${questionId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to delete question'
      );
    }
  },
};

// course Management Service
const courseManagementService = {
  createcourse: async (courseData) => {
    try {
      const response = await api.post('/instructor/courses', courseData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create course');
    }
  },

  getCourses: async () => {
    try {
      const response = await api.get('/instructor/courses');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch courses');
    }
  },

  updatecourse: async (courseId, courseData) => {
    try {
      const response = await api.put(`/instructor/courses/${courseId}`, courseData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update course');
    }
  },

  deletecourse: async (courseId) => {
    try {
      const response = await api.delete(`/instructor/courses/${courseId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete course');
    }
  },
};

// Question Bank Management Service
const questionBankManagementService = {
  createQuestionBank: async (course_id,bankData) => {
    try {
      const response = await api.post(`/instructor/question-banks`, { course_id: courseId, ...questionBankData });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create question bank');
    }
  },

  getQuestionBanks: async (courseId) => {
    try {
      const response = await api.get('/instructor/question-banks', {
        params: { course_id: courseId }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch question banks');
    }
  },

  getQuestionsInBank: async (bankId) => {
    try {
      const response = await api.get(`/instructor/question-banks/${bankId}/questions`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch questions');
    }
  },

  addQuestionsToBank: async (bankId, questions) => {
    try {
      const response = await api.post(`/instructor/question-banks/${bankId}/questions`, { questions });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add questions');
    }
  },
};

// Create examService as an alias for instructorService for backward compatibility
const examService = instructorService;

export {
  adminService,
  authService, courseManagementService, examService,
  instructorService,
  questionBankManagementService,
  questionBankService
};

