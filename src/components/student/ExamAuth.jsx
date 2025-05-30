import axios from 'axios';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';

export default function ExamAuth() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    email: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:3000/api/student/exam/validate-access',
        {
          examLinkId: examId,
          studentId: formData.studentId,
          email: formData.email,
        }
      );

      if (response.data.success) {
        if (response.data.showStats) {
          // Redirect to stats page
          navigate(`/exam/${examId}/stats`, {
            state: {
              examId: response.data.examId,
              examLinkId: examId,
              studentId: response.data.studentId,
            },
            replace: true,
          });
          return;
        }
        // Store exam session data
        sessionStorage.setItem(
          'examSession',
          JSON.stringify({
            examId: response.data.exam.id,
            studentId: formData.studentId,
            studentName: response.data.exam.studentName,
            duration: response.data.exam.duration,
          })
        );

        // Show success message
        toast.success('Access granted! Redirecting to exam...');

        // Redirect to exam page
        navigate(`/exam/${examId}/start`);
      }
    } catch (error) {
      console.error('Authentication error:', error);

      // Show appropriate error message
      const errorMessage =
        error.response?.data?.details ||
        error.response?.data?.error ||
        'Failed to validate exam access';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4 border border-slate-200">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Exam Access</h2>
            <p className="mt-2 text-sm text-slate-600">
              Please enter your credentials to access the exam
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="studentId"
                className="block text-sm font-medium text-slate-700"
              >
                Student ID
              </label>
              <input
                id="studentId"
                name="studentId"
                type="text"
                required
                value={formData.studentId}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400
                  focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                placeholder="Enter your student ID"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400
                  focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                placeholder="Enter your email address"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
                  ${
                    isLoading
                      ? 'bg-slate-400 cursor-not-allowed'
                      : 'bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500'
                  }`}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Validating...
                  </div>
                ) : (
                  'Access Exam'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">Need help?</span>
              </div>
            </div>
            <p className="mt-4 text-center text-sm text-slate-600">
              Contact your instructor if you&apos;re having trouble accessing
              the exam
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
