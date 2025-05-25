import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/api';

export default function Courses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [instructors, setInstructors] = useState([]);
  const [showAddCourseForm, setShowAddCourseForm] = useState(false);
  const [courseFormData, setCourseFormData] = useState({
    course_name: '',
    course_code: '',
    description: '',
    num_chapters: 1,
  });

  useEffect(() => {
    fetchCourses();
    fetchInstructors();
  }, []);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const response = await adminService.getAllCourses();
      console.log('Fetched courses:', response.data);
      setCourses(response.data);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch courses');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInstructors = async () => {
    try {
      const response = await adminService.getAllInstructors();
      console.log('Raw instructors response:', response);
      console.log('All instructors before filtering:', response.data);

      // Get currently assigned instructors for the selected course
      const currentlyAssigned = selectedCourse
        ? selectedCourse.assigned_instructors?.map((i) => i.user_id) || []
        : [];
      console.log('Currently assigned instructors:', currentlyAssigned);

      // Filter instructors who are both approved and active, and not already assigned
      const filteredInstructors = response.data.filter((instructor) => {
        const isEligible =
          instructor.is_approved === true &&
          instructor.is_active === true &&
          !currentlyAssigned.includes(instructor.user_id);
        console.log(
          `Instructor ${instructor.first_name} ${instructor.last_name}:`,
          {
            is_approved: instructor.is_approved,
            is_active: instructor.is_active,
            already_assigned: currentlyAssigned.includes(instructor.user_id),
            isEligible: isEligible,
          }
        );
        return isEligible;
      });

      console.log('Filtered instructors:', filteredInstructors);
      setInstructors(filteredInstructors);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch instructors');
    }
  };

  const handleAssignInstructor = async (courseId, instructorId) => {
    try {
      await adminService.assignInstructorToCourse(courseId, instructorId);
      toast.success(
        'Instructor assigned successfully. The instructor will need to refresh their page to see the new course.'
      );
      fetchCourses();
      setShowAssignModal(false);
    } catch (err) {
      toast.error(err.message || 'Failed to assign instructor');
    }
  };

  const handleRemoveInstructor = async (courseId, instructorId) => {
    if (
      !window.confirm(
        'Are you sure you want to remove this instructor from the course?'
      )
    ) {
      return;
    }

    try {
      await adminService.removeInstructorFromCourse(courseId, instructorId);
      toast.success('Instructor removed successfully');
      fetchCourses();
    } catch (err) {
      toast.error(err.message || 'Failed to remove instructor');
    }
  };

  const handleDeleteCourse = async (courseId, courseName) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the course "${courseName}"? This action cannot be undone and will delete all related data including question banks, questions, and exam records.`
      )
    ) {
      return;
    }

    try {
      await adminService.deleteCourse(courseId);
      toast.success('Course deleted successfully');
      fetchCourses();
    } catch (err) {
      toast.error(err.message || 'Failed to delete course');
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Create the course with chapters
      await adminService.createCourse({
        courseName: courseFormData.course_name,
        courseCode: courseFormData.course_code,
        description: courseFormData.description,
        numChapters: parseInt(courseFormData.num_chapters),
      });

      setShowAddCourseForm(false);
      setCourseFormData({
        course_name: '',
        course_code: '',
        description: '',
        num_chapters: 1,
      });

      // Refresh the courses list
      await fetchCourses();
      toast.success('Course created successfully');
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error(error.message || 'Failed to create course');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
          <button
            onClick={() => setShowAddCourseForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-slate-600 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
          >
            Add New Course
          </button>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">All Courses</h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage your courses and their instructors
            </p>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Active Instructors
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Question Banks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {courses.map((course) => (
                <tr key={course.course_id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {course.course_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {course.course_code}
                  </td>
                  <td className="px-6 py-4">
                    {course.assigned_instructors?.map((instructor) => (
                      <div
                        key={instructor.user_id}
                        className="flex items-center justify-between mb-2"
                      >
                        <span>
                          {instructor.first_name} {instructor.last_name}
                        </span>
                        <button
                          onClick={() =>
                            handleRemoveInstructor(
                              course.course_id,
                              instructor.user_id
                            )
                          }
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        setSelectedCourse(course);
                        setShowAssignModal(true);
                      }}
                      className="text-sm text-slate-600 hover:text-slate-900 font-medium"
                    >
                      + Assign Instructor
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {course.question_banks_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => {
                        console.log('Navigating to course:', course);
                        navigate(`/admin/courses/${course.course_id}`);
                      }}
                      className="text-slate-600 hover:text-slate-900 mr-4 font-medium"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() =>
                        handleDeleteCourse(course.course_id, course.course_name)
                      }
                      className="text-red-600 hover:text-red-900 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Course Modal */}
        {showAddCourseForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-800">
                  Create New Course
                </h3>
                <button
                  onClick={() => setShowAddCourseForm(false)}
                  className="text-slate-400 hover:text-slate-500 transition-colors duration-200"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleCreateCourse} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Course Name
                  </label>
                  <input
                    type="text"
                    value={courseFormData.course_name}
                    onChange={(e) =>
                      setCourseFormData((prev) => ({
                        ...prev,
                        course_name: e.target.value,
                      }))
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    placeholder="e.g., Computer Science"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Course Code
                  </label>
                  <input
                    type="text"
                    value={courseFormData.course_code}
                    onChange={(e) =>
                      setCourseFormData((prev) => ({
                        ...prev,
                        course_code: e.target.value,
                      }))
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    placeholder="e.g., CS101"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={courseFormData.description}
                    onChange={(e) =>
                      setCourseFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={3}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    placeholder="Enter a brief description of the course"
                  />
                </div>

                {/* Chapters Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Number of Chapters (1-20)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={courseFormData.num_chapters}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      setCourseFormData((prev) => ({
                        ...prev,
                        num_chapters: Math.min(20, Math.max(1, value)),
                      }));
                    }}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Enter a number between 1 and 20 chapters
                  </p>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddCourseForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-600 hover:bg-slate-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating...' : 'Create Course'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Assign Instructor Modal */}
        {showAssignModal && selectedCourse && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">
                  Assign Instructor to {selectedCourse.course_name}
                </h3>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="mt-4 max-h-60 overflow-y-auto">
                {instructors.length > 0 ? (
                  instructors.map((instructor) => (
                    <button
                      key={instructor.user_id}
                      onClick={() =>
                        handleAssignInstructor(
                          selectedCourse.course_id,
                          instructor.user_id
                        )
                      }
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded font-medium"
                    >
                      {instructor.first_name} {instructor.last_name}
                    </button>
                  ))
                ) : (
                  <p className="text-center text-gray-500 font-medium">
                    No available instructors found
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
