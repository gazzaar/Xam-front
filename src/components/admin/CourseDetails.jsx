import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { adminService } from '../../services/api';

export default function CourseDetails() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      setIsLoading(true);
      const response = await adminService.getCourseDetails(courseId);
      setCourse(response.data);
    } catch (err) {
      console.error('Error fetching course details:', err);
      toast.error(err.message || 'Failed to fetch course details');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-700"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-600 font-medium">
            Course not found
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {course.course_name}
          </h1>
          <p className="text-gray-500 font-medium">
            Course Code: {course.course_code}
          </p>
        </div>

        {/* Course Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Active Instructors
            </h3>
            <p className="text-3xl font-medium text-gray-900">
              {course.active_instructors_count}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Question Banks
            </h3>
            <p className="text-3xl font-medium text-gray-900">
              {course.question_banks_count}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Total Questions
            </h3>
            <p className="text-3xl font-medium text-gray-900">
              {course.total_questions}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Total Exams
            </h3>
            <p className="text-3xl font-medium text-gray-900">
              {course.total_exams}
            </p>
          </div>
        </div>

        {/* Current Instructors */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Current Instructors
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              List of instructors assigned to this course
            </p>
          </div>
          <div className="px-4 py-5 sm:px-6">
            {course.current_instructors.map((instructor) => (
              <div
                key={instructor.user_id}
                className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0"
              >
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {instructor.first_name} {instructor.last_name}
                  </h3>
                  <p className="text-sm text-gray-500">{instructor.email}</p>
                  <p className="text-sm text-gray-500">
                    Questions Created: {instructor.questions_created}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    Assigned:{' '}
                    {new Date(instructor.assigned_date).toLocaleDateString()}
                  </p>
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                      instructor.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {instructor.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Question Banks */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Question Banks
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              All question banks in this course
            </p>
          </div>
          <div className="px-4 sm:px-6 overflow-hidden">
            <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
              <div className="py-5">
                {course.question_banks.map((bank) => (
                  <div
                    key={bank.question_bank_id}
                    className="mb-6 last:mb-0 border-b border-gray-200 pb-6 last:border-0"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-900">
                        {bank.bank_name}
                      </h3>
                      <span className="text-sm text-gray-500">
                        Questions: {bank.question_count}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      {bank.description}
                    </p>
                    <p className="text-sm text-gray-500">
                      Created by: {bank.created_by_first_name}{' '}
                      {bank.created_by_last_name}
                    </p>
                    {bank.questions && (
                      <div className="mt-4 pl-4 border-l-2 border-gray-200">
                        {bank.questions.map((question) => (
                          <div
                            key={question.question_id}
                            className="mb-3 last:mb-0"
                          >
                            <p className="text-sm font-medium text-gray-900">
                              {question.question_text.substring(0, 100)}
                              {question.question_text.length > 100 ? '...' : ''}
                            </p>
                            <div className="flex items-center mt-1 text-xs text-gray-500">
                              <span className="mr-3">
                                Type: {question.question_type}
                              </span>
                              <span className="mr-3">
                                Points: {question.points}
                              </span>
                              <span>
                                Created by: {question.created_by.first_name}{' '}
                                {question.created_by.last_name}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Assignment History */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Assignment History
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              History of instructor assignments to this course
            </p>
          </div>
          <div className="px-4 py-5 sm:px-6">
            {course.assignment_history.map((assignment) => (
              <div
                key={assignment.assignment_id}
                className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0"
              >
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {assignment.first_name} {assignment.last_name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Assigned by: {assignment.assigned_by_first_name}{' '}
                    {assignment.assigned_by_last_name}
                  </p>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <p>
                    From:{' '}
                    {new Date(assignment.assigned_date).toLocaleDateString()}
                  </p>
                  {assignment.end_date && (
                    <p>
                      To: {new Date(assignment.end_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
