import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from 'react-router-dom';
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './components/admin/Dashboard';
import CreateExam from './components/instructor/CreateExam';
import InstructorDashboard from './components/instructor/Dashboard';
import ExamList from './components/instructor/ExamList';
import InstructorLayout from './components/instructor/InstructorLayout';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import SignUp from './components/SignUp';

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
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route index element={<Navigate to="dashboard" replace />} />
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
          <Route path="exams/:id" element={<div>View Exam</div>} />
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
      </Routes>
    </Router>
  );
}
