import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { adminService } from '../../services/api';

export default function Instructors() {
  const [instructors, setInstructors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmAction, setConfirmAction] = useState({
    type: null, // 'deactivate', 'reactivate', or 'delete'
    instructorId: null,
    instructorName: '',
  });
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    department: '',
  });
  const [formErrors, setFormErrors] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    department: '',
  });

  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    try {
      setIsLoading(true);
      const response = await adminService.getAllInstructors();
      setInstructors(response.data);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch instructors');
    } finally {
      setIsLoading(false);
    }
  };

  const openConfirmModal = (type, instructor) => {
    setConfirmAction({
      type,
      instructorId: instructor.user_id,
      instructorName: `${instructor.first_name} ${instructor.last_name}`,
    });
    setShowConfirmModal(true);
  };

  const handleConfirm = async () => {
    try {
      switch (confirmAction.type) {
        case 'deactivate':
          await adminService.deactivateInstructor(confirmAction.instructorId);
          toast.success('Instructor deactivated successfully');
          break;
        case 'reactivate':
          await adminService.reactivateInstructor(confirmAction.instructorId);
          toast.success('Instructor reactivated successfully');
          break;
        case 'delete':
          await adminService.deleteInstructor(confirmAction.instructorId);
          toast.success('Instructor permanently deleted');
          break;
        default:
          break;
      }
      setShowConfirmModal(false);
      fetchInstructors();
    } catch (err) {
      toast.error(err.message || `Failed to ${confirmAction.type} instructor`);
    }
  };

  const getModalContent = () => {
    switch (confirmAction.type) {
      case 'deactivate':
        return {
          title: 'Deactivate Instructor',
          message: `Are you sure you want to deactivate ${confirmAction.instructorName}? They will no longer be able to access the system, but their content will remain.`,
          confirmButton: 'Deactivate',
          confirmClass: 'bg-yellow-600 hover:bg-yellow-700',
        };
      case 'reactivate':
        return {
          title: 'Reactivate Instructor',
          message: `Are you sure you want to reactivate ${confirmAction.instructorName}? They will regain access to the system.`,
          confirmButton: 'Reactivate',
          confirmClass: 'bg-green-600 hover:bg-green-700',
        };
      case 'delete':
        return {
          title: 'Delete Instructor',
          message: `WARNING: This will permanently delete ${confirmAction.instructorName} from the system. This action cannot be undone. Are you sure?`,
          confirmButton: 'Delete Permanently',
          confirmClass: 'bg-red-600 hover:bg-red-700',
        };
      default:
        return {};
    }
  };

  const validateForm = () => {
    let errors = {};
    let isValid = true;

    // Username validation (min 3 chars, alphanumeric)
    if (formData.username.trim().length < 3) {
      errors.username = 'Username must be at least 3 characters long';
      isValid = false;
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username =
        'Username can only contain letters, numbers, and underscores';
      isValid = false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Password validation (min 6 chars, must contain number and letter)
    if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
      isValid = false;
    } else if (
      !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(formData.password)
    ) {
      errors.password =
        'Password must contain at least one letter and one number';
      isValid = false;
    }

    // First Name validation
    if (formData.firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters long';
      isValid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(formData.firstName)) {
      errors.firstName = 'First name can only contain letters';
      isValid = false;
    }

    // Last Name validation
    if (formData.lastName.trim().length < 2) {
      errors.lastName = 'Last name must be at least 2 characters long';
      isValid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(formData.lastName)) {
      errors.lastName = 'Last name can only contain letters';
      isValid = false;
    }

    // Department validation
    if (formData.department.trim().length < 2) {
      errors.department = 'Department must be at least 2 characters long';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      await adminService.createInstructor(formData);
      toast.success('Instructor created successfully');
      setShowAddForm(false);
      setFormData({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        department: '',
      });
      setFormErrors({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        department: '',
      });
      fetchInstructors();
    } catch (err) {
      toast.error(err.message || 'Failed to create instructor');
    }
  };

  const getStatusBadgeClass = (instructor) => {
    if (!instructor.is_active) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (instructor) => {
    if (!instructor.is_active) return 'Inactive';
    return 'Active';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-700"></div>
      </div>
    );
  }

  const modalContent = getModalContent();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Instructors</h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-slate-600 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
          >
            Add New Instructor
          </button>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              All Instructors
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage your instructors and their permissions
            </p>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Active Courses
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {instructors.map((instructor) => (
                <tr key={instructor.user_id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {instructor.first_name} {instructor.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {instructor.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {instructor.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {instructor.department || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                        instructor
                      )}`}
                    >
                      {getStatusText(instructor)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {instructor.active_courses}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {instructor.is_active ? (
                      <button
                        onClick={() =>
                          openConfirmModal('deactivate', instructor)
                        }
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        Deactivate
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() =>
                            openConfirmModal('reactivate', instructor)
                          }
                          className="text-green-600 hover:text-green-900 mr-2"
                        >
                          Reactivate
                        </button>
                        <button
                          onClick={() => openConfirmModal('delete', instructor)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="text-center">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {modalContent.title}
                  </h3>
                  <div className="mt-2 px-7 py-3">
                    <p className="text-sm text-gray-500">
                      {modalContent.message}
                    </p>
                  </div>
                  <div className="items-center px-4 py-3">
                    <button
                      onClick={handleConfirm}
                      className={`px-4 py-2 mr-2 text-white font-medium rounded-md ${modalContent.confirmClass}`}
                    >
                      {modalContent.confirmButton}
                    </button>
                    <button
                      onClick={() => setShowConfirmModal(false)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Instructor Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-[32rem] shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Add New Instructor</h3>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setFormErrors({});
                  }}
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
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border ${
                      formErrors.username ? 'border-red-500' : 'border-gray-300'
                    } px-3 py-2 focus:outline-none focus:ring-1 ${
                      formErrors.username
                        ? 'focus:ring-red-500'
                        : 'focus:ring-slate-500'
                    }`}
                    required
                  />
                  {formErrors.username && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.username}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border ${
                      formErrors.email ? 'border-red-500' : 'border-gray-300'
                    } px-3 py-2 focus:outline-none focus:ring-1 ${
                      formErrors.email
                        ? 'focus:ring-red-500'
                        : 'focus:ring-slate-500'
                    }`}
                    required
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.email}
                    </p>
                  )}
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`block w-full rounded-md border ${
                        formErrors.password
                          ? 'border-red-500'
                          : 'border-gray-300'
                      } px-3 py-2 pr-10 focus:outline-none focus:ring-1 ${
                        formErrors.password
                          ? 'focus:ring-red-500'
                          : 'focus:ring-slate-500'
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 px-3 flex items-center"
                    >
                      {showPassword ? (
                        <svg
                          className="h-5 w-5 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="h-5 w-5 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
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
                      )}
                    </button>
                  </div>
                  {formErrors.password && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border ${
                      formErrors.firstName
                        ? 'border-red-500'
                        : 'border-gray-300'
                    } px-3 py-2 focus:outline-none focus:ring-1 ${
                      formErrors.firstName
                        ? 'focus:ring-red-500'
                        : 'focus:ring-slate-500'
                    }`}
                    required
                  />
                  {formErrors.firstName && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border ${
                      formErrors.lastName ? 'border-red-500' : 'border-gray-300'
                    } px-3 py-2 focus:outline-none focus:ring-1 ${
                      formErrors.lastName
                        ? 'focus:ring-red-500'
                        : 'focus:ring-slate-500'
                    }`}
                    required
                  />
                  {formErrors.lastName && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.lastName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border ${
                      formErrors.department
                        ? 'border-red-500'
                        : 'border-gray-300'
                    } px-3 py-2 focus:outline-none focus:ring-1 ${
                      formErrors.department
                        ? 'focus:ring-red-500'
                        : 'focus:ring-slate-500'
                    }`}
                    required
                  />
                  {formErrors.department && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.department}
                    </p>
                  )}
                </div>

                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setFormErrors({});
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-slate-600 rounded-md hover:bg-slate-700"
                  >
                    Add Instructor
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
