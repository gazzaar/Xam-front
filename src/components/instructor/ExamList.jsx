import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { examService } from '../../services/api';

export default function ExamList() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [copiedLinkId, setCopiedLinkId] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    console.log('ExamList component mounted, fetching exams...');
    fetchExams();
    // Set up periodic refresh every 30 seconds
    const refreshInterval = setInterval(fetchExams, 30000);

    // Cleanup interval on component unmount
    return () => clearInterval(refreshInterval);
  }, []);

  const fetchExams = async () => {
    setIsLoading(true);
    setError('');
    try {
      console.log('Calling examService.getExams()...');
      const response = await examService.getExams();
      console.log('Fetched exams response:', response);

      if (Array.isArray(response)) {
        console.log(`Successfully fetched ${response.length} exams`);
        setExams(response);
      } else {
        console.error('Unexpected response format:', response);
        setError('Received invalid data format from server');
        setExams([]);
      }
    } catch (err) {
      console.error('Error fetching exams:', err);
      setError(err.message || 'Failed to fetch exams');
      setExams([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (examId) => {
    try {
      // Get the exam status before proceeding
      const examToDelete = exams.find((exam) => exam.exam_id === examId);
      if (!examToDelete) {
        toast.error('Exam not found');
        return;
      }

      const status = calculateStatus(
        examToDelete.start_date,
        examToDelete.end_date
      );
      if (status === 'active') {
        toast.error('Cannot delete an active exam');
        setShowDeleteConfirm(null);
        return;
      }

      setIsLoading(true);
      await examService.deleteExam(examId);
      setShowDeleteConfirm(null);
      // Show success toast
      toast.success('Exam deleted successfully');
      // Refresh the exam list
      await fetchExams();
    } catch (err) {
      console.error('Error deleting exam:', err);
      setError(err.message || 'Failed to delete exam');
      toast.error(err.message || 'Failed to delete exam');
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(null);
    }
  };

  const calculateStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
      return 'upcoming';
    } else if (now >= start && now <= end) {
      return 'active';
    } else {
      return 'completed';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'upcoming':
        return 'bg-yellow-100 text-yellow-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-slate-100 text-slate-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const copyExamLink = (examLinkId) => {
    const examUrl = `${window.location.origin}/exam/${examLinkId}`;
    navigator.clipboard.writeText(examUrl).then(() => {
      setCopiedLinkId(examLinkId);
      toast.success('Exam link copied to clipboard');
      // Reset the copied state after 3 seconds
      setTimeout(() => setCopiedLinkId(null), 3000);
    });
  };

  const handleExportGrades = async (examId) => {
    try {
      setIsExporting(true);
      const response = await examService.exportStudentGrades(examId);

      // Create a blob from the CSV data
      const blob = new Blob([response], { type: 'text/csv' });

      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `exam_${examId}_grades.csv`);

      // Append link to body, click it, and remove it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL
      window.URL.revokeObjectURL(url);

      toast.success('Grades exported successfully');
    } catch (err) {
      console.error('Error exporting grades:', err);
      toast.error('Failed to export grades');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-700"></div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative p-6 border w-96 shadow-lg rounded-md bg-white">
            <div className="text-center">
              <h3 className="text-lg leading-6 font-medium text-slate-800 mb-3">
                Delete Exam
              </h3>
              <div className="mb-4">
                <p className="text-sm text-slate-600">
                  Are you sure you want to delete this exam? This action cannot
                  be undone.
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">My Exams</h1>
        <Link
          to="/instructor/create-exam"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-700 hover:bg-slate-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500"
        >
          Create New Exam
        </Link>
      </div>

      {exams.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-slate-600">
            No exams found. Click &quot;Create New Exam&quot; to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
          {exams.map((exam) => (
            <div
              key={exam.exam_id}
              className="bg-white rounded-lg shadow-md border border-slate-200 p-6 hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                {/* Left section - Exam details */}
                <div className="flex-grow space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800">
                      {exam.exam_name}
                    </h2>
                    {exam.description && (
                      <p className="text-sm text-slate-600 mt-1">
                        {exam.description}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-600">
                        Status
                      </p>
                      <span
                        className={`mt-1 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                          calculateStatus(exam.start_date, exam.end_date)
                        )}`}
                      >
                        {calculateStatus(exam.start_date, exam.end_date)}
                      </span>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-600">
                        Duration
                      </p>
                      <p className="text-sm text-slate-800">
                        {formatDate(exam.start_date)} -{' '}
                        {formatDate(exam.end_date)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-2">
                      Questions Distribution
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {exam.question_references &&
                        exam.question_references.map((ref, index) => (
                          <div
                            key={index}
                            className="bg-slate-50 rounded-md p-2 text-sm"
                          >
                            <span className="font-medium text-slate-700">
                              {ref.chapter}:
                            </span>
                            <span className="text-slate-600 ml-1">
                              {ref.count} questions
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Right section - Actions */}
                <div className="flex flex-col gap-3 min-w-[200px]">
                  <button
                    onClick={() => copyExamLink(exam.exam_link_id)}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors duration-200"
                  >
                    {copiedLinkId === exam.exam_link_id ? (
                      <>
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                          />
                        </svg>
                        Copy Link
                      </>
                    )}
                  </button>

                  <button
                    onClick={() =>
                      navigate(`/instructor/exams/${exam.exam_id}`)
                    }
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors duration-200"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    View Details
                  </button>

                  {calculateStatus(exam.start_date, exam.end_date) ===
                    'completed' && (
                    <button
                      onClick={() => handleExportGrades(exam.exam_id)}
                      disabled={isExporting}
                      className="w-full inline-flex items-center justify-center px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors duration-200"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      {isExporting ? 'Exporting...' : 'Export Grades'}
                    </button>
                  )}

                  <button
                    onClick={() => setShowDeleteConfirm(exam.exam_id)}
                    disabled={
                      calculateStatus(exam.start_date, exam.end_date) ===
                      'active'
                    }
                    className={`w-full inline-flex items-center justify-center px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 transition-colors duration-200 ${
                      calculateStatus(exam.start_date, exam.end_date) ===
                      'active'
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                    title={
                      calculateStatus(exam.start_date, exam.end_date) ===
                      'active'
                        ? 'Cannot delete an active exam'
                        : 'Delete exam'
                    }
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
