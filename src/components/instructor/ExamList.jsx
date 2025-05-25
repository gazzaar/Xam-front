import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { examService } from '../../services/api';

export default function ExamList() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

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
      setIsLoading(true);
      await examService.deleteExam(examId);
      setShowDeleteConfirm(null);
      // Refresh the exam list
      await fetchExams();
    } catch (err) {
      console.error('Error deleting exam:', err);
      setError(err.message || 'Failed to delete exam');
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(null);
    }
  };

  const canEditOrDelete = (exam) => {
    console.log('Exam status check:', {
      examId: exam.exam_id,
      status: getExamStatus(exam.start_date, exam.end_date),
      attempts: exam.attempts_made,
      startDate: exam.start_date,
      endDate: exam.end_date,
    });

    return getExamStatus(exam.start_date, exam.end_date) === 'Pending';
  };

  const getStatusBadgeClass = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
      return 'bg-yellow-100 text-yellow-800'; // Pending
    } else if (now >= start && now <= end) {
      return 'bg-green-100 text-green-800'; // Active
    } else {
      return 'bg-gray-100 text-gray-800'; // Completed
    }
  };

  const getExamStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
      return 'Pending';
    } else if (now >= start && now <= end) {
      return 'Active';
    } else {
      return 'Completed';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
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

      <div className="bg-white shadow overflow-hidden rounded-lg border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                >
                  Exam Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                >
                  Start Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                >
                  End Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                >
                  Questions
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {exams.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-sm text-slate-500"
                  >
                    No exams found. Click "Create New Exam" to get started.
                  </td>
                </tr>
              ) : (
                exams.map((exam) => (
                  <tr
                    key={exam.exam_id}
                    className="hover:bg-slate-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-800">
                        {exam.exam_name}
                      </div>
                      <div className="text-sm text-slate-500">
                        {exam.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                          exam.start_date,
                          exam.end_date
                        )}`}
                      >
                        {exam.status ||
                          getExamStatus(exam.start_date, exam.end_date)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {formatDate(exam.start_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {formatDate(exam.end_date)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600">
                        {exam.question_references &&
                          exam.question_references.map((ref, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-1 mb-1"
                            >
                              <span className="font-medium">
                                {ref.chapter}:
                              </span>
                              <span>{ref.count} questions</span>
                            </div>
                          ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() =>
                          navigate(`/instructor/exams/${exam.exam_id}`)
                        }
                        className="text-slate-600 hover:text-slate-900 mr-4 transition-colors duration-200"
                      >
                        <span className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-1"
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
                          View
                        </span>
                      </button>
                      {canEditOrDelete(exam) && (
                        <button
                          onClick={() => setShowDeleteConfirm(exam.exam_id)}
                          className="text-red-600 hover:text-red-900 transition-colors duration-200"
                        >
                          <span className="flex items-center">
                            <svg
                              className="w-4 h-4 mr-1"
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
                          </span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
