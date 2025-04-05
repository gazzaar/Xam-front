import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { examService } from '../../services/api';

export default function ExamList() {
  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setIsLoading(true);
      const response = await examService.getExams();
      if (response.success) {
        setExams(response.data);
      }
    } catch (err) {
      setError('Failed to load exams');
      console.error('Error fetching exams:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (examId) => {
    try {
      await examService.deleteExam(examId);
      fetchExams();
      setShowDeleteConfirm(null);
    } catch (err) {
      setError(err.message || 'Failed to delete exam');
      console.error('Error deleting exam:', err);
      setShowDeleteConfirm(null);
    }
  };

  const canEditOrDelete = (exam) => {
    // Add debug logging
    console.log('Exam status check:', {
      examId: exam.exam_id,
      status: getExamStatus(exam.start_date, exam.end_date),
      attempts: exam.attempts_made,
      startDate: exam.start_date,
      endDate: exam.end_date,
    });

    // Only check if it's pending
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-700"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Delete Exam
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete this exam? This action cannot
                  be undone.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 mr-2"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-base font-medium rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Exams</h1>
        <Link
          to="/instructor/create-exam"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-700 hover:bg-slate-600"
        >
          Create New Exam
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {exams.map((exam) => (
            <li key={exam.exam_id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-medium text-gray-900 truncate">
                      {exam.exam_name}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {exam.description}
                    </p>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                        exam.start_date,
                        exam.end_date
                      )}`}
                    >
                      {getExamStatus(exam.start_date, exam.end_date)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Duration
                    </p>
                    <p className="mt-1 text-sm text-gray-900">
                      {exam.duration} minutes
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Start Date
                    </p>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatDate(exam.start_date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      End Date
                    </p>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatDate(exam.end_date)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Registered Students
                    </p>
                    <p className="mt-1 text-sm text-gray-900">
                      {exam.total_students}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total Attempts
                    </p>
                    <p className="mt-1 text-sm text-gray-900">
                      {exam.attempts_made}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-500">
                    Students & Access Codes
                  </p>
                  <div className="mt-1 text-sm text-gray-900">
                    <p>Registered Students: {exam.total_students}</p>
                    {exam.student_access_codes &&
                      exam.student_access_codes.length > 0 && (
                        <div className="mt-2">
                          <button
                            onClick={() => {
                              // Create CSV content
                              const csvContent =
                                'Student Email,Access Code\n' +
                                exam.student_access_codes
                                  .map(
                                    ({ email, access_code }) =>
                                      `${email},${access_code}`
                                  )
                                  .join('\n');

                              // Create blob and download
                              const blob = new Blob([csvContent], {
                                type: 'text/csv',
                              });
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.setAttribute('hidden', '');
                              a.setAttribute('href', url);
                              a.setAttribute(
                                'download',
                                `access_codes_${exam.exam_name}.csv`
                              );
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                            }}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-slate-600 hover:bg-slate-700"
                          >
                            Download Access Codes
                          </button>
                          <p className="mt-1 text-xs text-gray-500">
                            Download a CSV file containing student emails and
                            their access codes
                          </p>
                        </div>
                      )}
                  </div>
                </div>

                <div className="mt-4 flex space-x-4">
                  <Link
                    to={`/instructor/exams/${exam.exam_id}`}
                    className="text-slate-600 hover:text-slate-900 text-sm font-medium"
                  >
                    View Details
                  </Link>
                  <Link
                    to={`/instructor/exams/${exam.exam_id}/results`}
                    className="text-slate-600 hover:text-slate-900 text-sm font-medium"
                  >
                    View Results
                  </Link>
                  {canEditOrDelete(exam) && (
                    <>
                      <Link
                        to={`/instructor/exams/${exam.exam_id}/edit`}
                        className="text-slate-600 hover:text-slate-900 text-sm font-medium"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => setShowDeleteConfirm(exam.exam_id)}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </>
                  )}
                  {!canEditOrDelete(exam) && (
                    <span className="text-xs text-gray-500 italic">
                      {getExamStatus(exam.start_date, exam.end_date) !==
                      'Pending'
                        ? 'Cannot edit/delete - exam has started or ended'
                        : exam.attempts_made > 0
                        ? 'Cannot edit/delete - exam has been attempted'
                        : ''}
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
