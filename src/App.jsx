import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { Toaster } from 'react-hot-toast';
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from 'react-router-dom';
import AdminLayout from './components/admin/AdminLayout';
import CourseDetails from './components/admin/CourseDetails';
import Courses from './components/admin/Courses';
import Dashboard from './components/admin/Dashboard';
import Instructors from './components/admin/Instructors';
import CreateExam from './components/instructor/CreateExam';
import InstructorDashboard from './components/instructor/Dashboard';
import ExamList from './components/instructor/ExamList';
import ExamPreview from './components/instructor/ExamPreview';
import InstructorLayout from './components/instructor/InstructorLayout';
import QuestionBank from './components/instructor/QuestionBank';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Payment from './components/Payment';
import ExamAuth from './components/student/ExamAuth';
import ExamComplete from './components/student/ExamComplete';
import ExamStart from './components/student/ExamStart';
import ExamTake from './components/student/ExamTake';
import './styles/custom.css';
import theme from './theme';

// Protected Route component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default function App() {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  const defaultRoute =
    userRole === 'instructor' ? '/instructor/dashboard' : '/admin/dashboard';

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster position="top-right" />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Student Exam Routes */}
          <Route path="/exam/:examId" element={<ExamAuth />} />
          <Route path="/exam/:examId/start" element={<ExamStart />} />
          <Route path="/exam/:examId/take" element={<ExamTake />} />
          <Route path="/exam/:examId/complete" element={<ExamComplete />} />
          <Route path="/exam/:examId/stats" element={<ExamComplete />} />
          <Route path="/exam-complete" element={<ExamComplete />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="instructors" element={<Instructors />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="courses" element={<Courses />} />
            <Route path="courses/:courseId" element={<CourseDetails />} />
          </Route>

          {/* Instructor Routes */}
          <Route
            path="/instructor"
            element={
              <ProtectedRoute allowedRoles={['instructor']}>
                <InstructorLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<InstructorDashboard />} />
            <Route path="exams" element={<ExamList />} />
            <Route path="create-exam" element={<CreateExam />} />
            <Route path="question-bank" element={<QuestionBank />} />
            <Route path="exams/:id" element={<ExamPreview />} />
            <Route path="exams/:id/edit" element={<div>Edit Exam</div>} />
            <Route path="exams/:id/results" element={<div>Exam Results</div>} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Landing Page and Default Routes */}
          <Route
            path="/"
            element={
              token ? <Navigate to={defaultRoute} replace /> : <LandingPage />
            }
          />

          {/* Payment Routes */}
          <Route path="/payment/:plan" element={<Payment />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
