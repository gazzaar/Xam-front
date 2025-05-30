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
      // Don't use window.location.href as it causes refresh
      return Promise.reject({ ...error, shouldRedirect: true });
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
        return {
          success: true,
          user: response.data.user,
          token: response.data.token,
        };
      }
      return {
        success: false,
        message: 'Invalid response from server',
      };
    } catch (error) {
      if (error.response?.data?.message) {
        return {
          success: false,
          message: error.response.data.message,
          status: error.response.status,
        };
      }
      return {
        success: false,
        message: 'Network error or server is unreachable',
      };
    }
  },

  logout: async () => {
    try {
      // Call logout endpoint to invalidate session on server
      await api.post('/auth/logout');
      // Clear all auth-related data from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userFirstName');
      localStorage.removeItem('userLastName');

      // Return success without forcing page reload
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Even if the server call fails, we should still clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userFirstName');
      localStorage.removeItem('userLastName');

      return { success: false, error: error.message };
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

  deactivateInstructor: async (instructorId) => {
    try {
      const response = await api.put(
        `/admin/instructors/${instructorId}/deactivate`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to deactivate instructor'
      );
    }
  },

  reactivateInstructor: async (instructorId) => {
    try {
      const response = await api.put(
        `/admin/instructors/${instructorId}/reactivate`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to reactivate instructor'
      );
    }
  },

  deleteInstructor: async (instructorId) => {
    try {
      const response = await api.delete(
        `/admin/instructors/${instructorId}/permanent`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          'Failed to permanently delete instructor'
      );
    }
  },

  // Course Management
  createCourse: async (courseData) => {
    try {
      const response = await api.post('/admin/courses', courseData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to create course'
      );
    }
  },

  addChaptersToCourse: async (courseId, numChapters) => {
    try {
      const response = await api.post(`/admin/courses/${courseId}/chapters`, {
        numChapters,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to add chapters to course'
      );
    }
  },

  getAllCourses: async () => {
    try {
      const response = await api.get('/admin/courses');
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch courses'
      );
    }
  },

  updateCourse: async (courseId, courseData) => {
    try {
      const response = await api.put(`/admin/courses/${courseId}`, courseData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to update course'
      );
    }
  },

  deleteCourse: async (courseId) => {
    try {
      const response = await api.delete(`/admin/courses/${courseId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to delete course'
      );
    }
  },

  // Course Assignment Management
  assignInstructorToCourse: async (courseId, instructorId) => {
    try {
      const response = await api.post(
        `/admin/courses/${courseId}/instructors/${instructorId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to assign instructor to course'
      );
    }
  },

  removeInstructorFromCourse: async (courseId, instructorId) => {
    try {
      const response = await api.delete(
        `/admin/courses/${courseId}/instructors/${instructorId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          'Failed to remove instructor from course'
      );
    }
  },

  // Question Bank Management
  createQuestionBank: async (questionBankData) => {
    try {
      const response = await api.post(
        '/admin/question-banks',
        questionBankData
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to create question bank'
      );
    }
  },

  getQuestionBanks: async (courseId) => {
    try {
      const response = await api.get(
        `/admin/courses/${courseId}/question-banks`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch question banks'
      );
    }
  },

  updateQuestionBank: async (bankId, questionBankData) => {
    try {
      const response = await api.put(
        `/admin/question-banks/${bankId}`,
        questionBankData
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to update question bank'
      );
    }
  },

  deleteQuestionBank: async (bankId) => {
    try {
      const response = await api.delete(`/admin/question-banks/${bankId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to delete question bank'
      );
    }
  },

  createInstructor: async (instructorData) => {
    try {
      const response = await api.post('/admin/instructors', instructorData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to create instructor'
      );
    }
  },

  getCourseDetails: async (courseId) => {
    try {
      const response = await api.get(`/admin/courses/${courseId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch course details'
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
      return response.data; // Wrap the response data to match expected format
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to create exam');
    }
  },

  getExams: async () => {
    try {
      const response = await api.get('/instructor/exams');
      return response.data; // Return the data directly without wrapping
    } catch (error) {
      console.error('Error fetching exams:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch exams');
    }
  },

  getExamPreview: async (examId) => {
    try {
      const response = await api.get(`/instructor/exams/${examId}/preview`);
      return response.data;
    } catch (error) {
      console.error('Error fetching exam preview:', error);
      throw new Error(
        error.response?.data?.error || 'Failed to fetch exam preview'
      );
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
      formData.append('students', file); // Changed from 'file' to 'students' to match backend expectation

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
      console.error('Error in getCourses:', error.response || error);
      throw new Error(error.response?.data?.error || 'Failed to fetch courses');
    }
  },

  // Chapter Management
  addChaptersToCourse: async (courseId, { num_chapters }) => {
    try {
      const response = await api.post(
        `/instructor/courses/${courseId}/chapters`,
        {
          num_chapters,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to add chapters');
    }
  },

  getChaptersForCourse: async (courseId) => {
    try {
      const response = await api.get(
        `/instructor/courses/${courseId}/chapters`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || 'Failed to fetch chapters'
      );
    }
  },

  deleteChapter: async (courseId, chapterId) => {
    try {
      const response = await api.delete(
        `/instructor/courses/${courseId}/chapters/${chapterId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || 'Failed to delete chapter'
      );
    }
  },

  updateCourse: async (courseId, courseData) => {
    try {
      const response = await api.put(
        `/instructor/courses/${courseId}`,
        courseData
      );
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

  getQuestionBankStats: async (bankId) => {
    try {
      const response = await api.get(
        `/instructor/question-banks/${bankId}/stats`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error ||
          'Failed to fetch question bank statistics'
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
      const response = await api.delete(
        `/instructor/question-banks/${questionBankId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || 'Failed to delete question bank'
      );
    }
  },

  addQuestionsToQuestionBank: async (questionBankId, questions) => {
    try {
      const response = await api.post(
        `/instructor/question-banks/${questionBankId}/questions`,
        { questions }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to add questions'
      );
    }
  },

  getQuestionsInQuestionBank: async (questionBankId) => {
    try {
      const response = await api.get(
        `/instructor/question-banks/${questionBankId}/questions`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch questions'
      );
    }
  },

  // Update question in question bank
  updateQuestionInQuestionBank: async (
    questionBankId,
    questionId,
    questionData
  ) => {
    try {
      const response = await api.put(
        `/instructor/question-banks/${questionBankId}/questions/${questionId}`,
        questionData
      );
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
      const response = await api.delete(
        `/instructor/question-banks/${questionBankId}/questions/${questionId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting question from bank:', error);
      throw new Error(
        error.response?.data?.error || 'Failed to delete question'
      );
    }
  },

  // Update question
  updateQuestion: async (questionId, questionData) => {
    try {
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
      const response = await api.delete(`/instructor/questions/${questionId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting question:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to delete question'
      );
    }
  },

  validateStudentFile: async (formData) => {
    try {
      const response = await api.post(
        '/instructor/validate-student-file',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || 'Failed to validate student file'
      );
    }
  },

  createExamWithStudents: async (examData, studentFile) => {
    try {
      const formData = new FormData();
      formData.append('examData', JSON.stringify(examData));
      formData.append('students', studentFile);

      const response = await api.post(
        '/instructor/exams/create-with-students',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to create exam');
    }
  },

  exportStudentGrades: async (examId) => {
    try {
      const response = await api.get(
        `/instructor/exams/${examId}/export-grades`,
        {
          responseType: 'blob', // Important: This tells axios to handle the response as a blob
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to export grades'
      );
    }
  },

  importQuestionsFromJson: async (questionBankId, jsonFile) => {
    try {
      const formData = new FormData();
      formData.append('questions', jsonFile);

      const response = await api.post(
        `/instructor/question-banks/${questionBankId}/import`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || 'Failed to import questions'
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
      throw new Error(
        error.response?.data?.message || 'Failed to create course'
      );
    }
  },

  getCourses: async () => {
    try {
      const response = await api.get('/instructor/courses');
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch courses'
      );
    }
  },

  updatecourse: async (courseId, courseData) => {
    try {
      const response = await api.put(
        `/instructor/courses/${courseId}`,
        courseData
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to update course'
      );
    }
  },

  deletecourse: async (courseId) => {
    try {
      const response = await api.delete(`/instructor/courses/${courseId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to delete course'
      );
    }
  },
};

// Question Bank Management Service
const questionBankManagementService = {
  createQuestionBank: async (courseId, bankData) => {
    try {
      const response = await api.post(`/instructor/question-banks`, {
        course_id: courseId,
        ...bankData,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to create question bank'
      );
    }
  },

  getQuestionBanks: async (courseId) => {
    try {
      const response = await api.get('/instructor/question-banks', {
        params: { course_id: courseId },
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch question banks'
      );
    }
  },

  getQuestionsInBank: async (bankId) => {
    try {
      const response = await api.get(
        `/instructor/question-banks/${bankId}/questions`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch questions'
      );
    }
  },

  addQuestionsToBank: async (bankId, questions) => {
    try {
      const response = await api.post(
        `/instructor/question-banks/${bankId}/questions`,
        { questions }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to add questions'
      );
    }
  },
};

// Create examService as an alias for instructorService for backward compatibility
const examService = instructorService;

// Student Stats Service
const studentStatsService = {
  getExamStats: async (examId, studentId) => {
    try {
      const params = studentId ? { studentId } : undefined;
      const response = await api.get(`/student/exam/${examId}/stats`, {
        params,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || 'Failed to fetch exam stats'
      );
    }
  },
};

export {
  adminService,
  authService,
  courseManagementService,
  examService,
  instructorService,
  questionBankManagementService,
  questionBankService,
  studentStatsService,
};
