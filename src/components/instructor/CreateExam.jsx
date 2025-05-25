import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { examService, instructorService } from '../../services/api';

export default function CreateExam() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [courses, setCourses] = useState([]);
  const [questionBanks, setQuestionBanks] = useState([]);
  const [examData, setExamData] = useState({
    exam_name: '',
    description: '',
    start_date: '',
    end_date: '',
    duration: 60,
    exam_link_id: generateRandomCode(8), // Generate a random link ID
    is_randomized: true, // Default to randomized questions
    course_id: '',
    question_bank_id: '',
    total_questions: 20,
    chapterDistribution: [{ chapter: '', questionCount: 5 }], // Initialize with one chapter
    difficultyDistribution: {
      easy: 30,
      medium: 50,
      hard: 20,
    },
  });
  const [studentFile, setStudentFile] = useState(null);

  useEffect(() => {
    // Fetch courses when component mounts
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await instructorService.getCourses();
      setCourses(response);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Failed to fetch courses');
    }
  };

  const fetchQuestionBanks = async (courseId) => {
    if (!courseId) return;

    try {
      const response = await instructorService.getQuestionBanksByCourse(
        courseId
      );
      setQuestionBanks(response);
    } catch (error) {
      console.error('Error fetching question banks:', error);
      setError('Failed to fetch question banks');
    }
  };

  // Generate a random alphanumeric code for exam link
  function generateRandomCode(length) {
    const characters = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789'; // Removed similar looking characters
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return result;
  }

  const handleExamDataChange = (e) => {
    const { name, value } = e.target;

    if (name === 'course_id') {
      // When course changes, fetch question banks for that course
      fetchQuestionBanks(value);
      // Reset question bank selection
      setExamData((prev) => ({
        ...prev,
        [name]: value,
        question_bank_id: '',
      }));
    } else {
      setExamData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleChapterChange = (index, field, value) => {
    setExamData((prev) => {
      const newDistribution = [...prev.chapterDistribution];
      newDistribution[index] = {
        ...newDistribution[index],
        [field]: value,
      };
      return { ...prev, chapterDistribution: newDistribution };
    });
  };

  const handleDifficultyChange = (difficulty, value) => {
    // Ensure the value is a number between 0 and 100
    const numValue = Math.min(100, Math.max(0, parseInt(value) || 0));

    setExamData((prev) => ({
      ...prev,
      difficultyDistribution: {
        ...prev.difficultyDistribution,
        [difficulty]: numValue,
      },
    }));
  };

  const addChapter = () => {
    setExamData((prev) => ({
      ...prev,
      chapterDistribution: [
        ...prev.chapterDistribution,
        { chapter: '', questionCount: 5 },
      ],
    }));
  };

  const removeChapter = (index) => {
    setExamData((prev) => ({
      ...prev,
      chapterDistribution: prev.chapterDistribution.filter(
        (_, i) => i !== index
      ),
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    // Validate that it's a CSV file
    if (file && file.type !== 'text/csv') {
      setError('Please upload a CSV file');
      e.target.value = ''; // Reset the input
      return;
    }
    setStudentFile(file);
  };

  const regenerateExamLink = () => {
    setExamData((prev) => ({
      ...prev,
      exam_link_id: generateRandomCode(8),
    }));
  };

  const validateExamData = () => {
    if (!examData.exam_name || !examData.description) {
      setError('Please fill in all required fields');
      return false;
    }
    if (!examData.start_date || !examData.end_date) {
      setError('Please select start and end dates');
      return false;
    }
    if (new Date(examData.start_date) >= new Date(examData.end_date)) {
      setError('End date must be after start date');
      return false;
    }
    if (examData.duration < 1) {
      setError('Duration must be at least 1 minute');
      return false;
    }

    if (!examData.course_id) {
      setError('Please select a course');
      return false;
    }

    if (!examData.question_bank_id) {
      setError('Please select a question bank');
      return false;
    }

    if (examData.total_questions < 1) {
      setError('Total questions must be at least 1');
      return false;
    }

    // Validate chapter distribution
    if (examData.chapterDistribution.some((item) => !item.chapter.trim())) {
      setError('Please fill in all chapter names or remove empty ones');
      return false;
    }

    if (examData.chapterDistribution.some((item) => item.questionCount < 1)) {
      setError('Each chapter must have at least 1 question');
      return false;
    }

    // Validate difficulty distribution
    const totalDifficulty =
      examData.difficultyDistribution.easy +
      examData.difficultyDistribution.medium +
      examData.difficultyDistribution.hard;

    if (totalDifficulty !== 100) {
      setError('Difficulty distribution must add up to 100%');
      return false;
    }

    // Validate student file
    if (!studentFile) {
      setError(
        'Please upload a CSV file with the list of students allowed to take this exam'
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateExamData()) return;

    setError('');
    setIsLoading(true);

    try {
      // Format dates to ISO string format
      const formattedExamData = {
        ...examData,
        start_date: examData.start_date
          ? new Date(examData.start_date).toISOString()
          : null,
        end_date: examData.end_date
          ? new Date(examData.end_date).toISOString()
          : null,
        // Format chapter distribution for the API
        chapterDistribution: examData.chapterDistribution.map((item) => ({
          chapter: item.chapter,
          count: parseInt(item.questionCount),
        })),
        // Include difficulty distribution
        difficultyDistribution: {
          easy: examData.difficultyDistribution.easy,
          medium: examData.difficultyDistribution.medium,
          hard: examData.difficultyDistribution.hard,
        },
        // Include course and question bank IDs
        course_id: examData.course_id,
        question_bank_id: examData.question_bank_id,
        total_questions: parseInt(examData.total_questions),
      };

      // Create the exam
      const examResponse = await examService.createExam(formattedExamData);
      console.log('Exam response:', examResponse);

      if (examResponse && examResponse.data && examResponse.data.exam_id) {
        // Navigate to the exams list page
        navigate('/instructor/exams');
      } else {
        setError('Failed to create exam: Invalid response from server');
      }
    } catch (error) {
      console.error('Error creating exam:', error);
      setError(error.message || 'Failed to create exam');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate the exam URL that students will use
  const examUrl = `${window.location.origin}/exam/${examData.exam_link_id}`;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-3xl font-bold text-slate-800">
          Create New Exam
        </h1>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6 border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">
              Exam Details
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Exam Name
                </label>
                <input
                  type="text"
                  name="exam_name"
                  value={examData.exam_name}
                  onChange={handleExamDataChange}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:ring-slate-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={examData.description}
                  onChange={handleExamDataChange}
                  rows="3"
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:ring-slate-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Start Date
                  </label>
                  <input
                    type="datetime-local"
                    name="start_date"
                    value={examData.start_date}
                    onChange={handleExamDataChange}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:ring-slate-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    End Date
                  </label>
                  <input
                    type="datetime-local"
                    name="end_date"
                    value={examData.end_date}
                    onChange={handleExamDataChange}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:ring-slate-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  name="duration"
                  value={examData.duration}
                  onChange={handleExamDataChange}
                  min="1"
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:ring-slate-500"
                  required
                />
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6 border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">
              Exam Content
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Course <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="course_id"
                    value={examData.course_id}
                    onChange={handleExamDataChange}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                      focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                    required
                  >
                    <option value="">Select a course</option>
                    {courses.map((course) => (
                      <option key={course.course_id} value={course.course_id}>
                        {course.course_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Question Bank <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="question_bank_id"
                    value={examData.question_bank_id}
                    onChange={handleExamDataChange}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                      focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                    required
                    disabled={!examData.course_id}
                  >
                    <option value="">Select a question bank</option>
                    {questionBanks.map((bank) => (
                      <option
                        key={bank.question_bank_id}
                        value={bank.question_bank_id}
                      >
                        {bank.bank_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Total Questions <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  name="total_questions"
                  value={examData.total_questions}
                  onChange={handleExamDataChange}
                  min="1"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                    focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Chapter Distribution <span className="text-red-600">*</span>
                </label>
                <div className="space-y-3">
                  {examData.chapterDistribution.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={item.chapter}
                        onChange={(e) =>
                          handleChapterChange(index, 'chapter', e.target.value)
                        }
                        placeholder="Chapter name"
                        className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                          focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                      />
                      <input
                        type="number"
                        value={item.questionCount}
                        onChange={(e) =>
                          handleChapterChange(
                            index,
                            'questionCount',
                            e.target.value
                          )
                        }
                        min="1"
                        className="w-20 px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                          focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                      />
                      {examData.chapterDistribution.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeChapter(index)}
                          className="p-2 text-red-500 hover:text-red-700 transition-colors duration-200"
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addChapter}
                    className="inline-flex items-center px-3 py-1.5 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors duration-200"
                  >
                    <svg
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Add Chapter
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Difficulty Distribution (%){' '}
                  <span className="text-red-600">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">
                      Easy
                    </label>
                    <input
                      type="number"
                      value={examData.difficultyDistribution.easy}
                      onChange={(e) =>
                        handleDifficultyChange('easy', e.target.value)
                      }
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                        focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">
                      Medium
                    </label>
                    <input
                      type="number"
                      value={examData.difficultyDistribution.medium}
                      onChange={(e) =>
                        handleDifficultyChange('medium', e.target.value)
                      }
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                        focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">
                      Hard
                    </label>
                    <input
                      type="number"
                      value={examData.difficultyDistribution.hard}
                      onChange={(e) =>
                        handleDifficultyChange('hard', e.target.value)
                      }
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                        focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                    />
                  </div>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  Total:{' '}
                  {examData.difficultyDistribution.easy +
                    examData.difficultyDistribution.medium +
                    examData.difficultyDistribution.hard}
                  % (must equal 100%)
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6 border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">
              Exam Access
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Exam Link
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="text"
                    value={examUrl}
                    className="flex-grow rounded-l-md border border-r-0 border-slate-300 px-3 py-2 bg-slate-50 text-slate-700"
                    readOnly
                  />
                  <button
                    type="button"
                    onClick={regenerateExamLink}
                    className="inline-flex items-center px-3 py-2 border border-l-0 border-slate-300 rounded-r-md bg-slate-50 text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors duration-200"
                    title="Generate new link"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </button>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  This is the link students will use to access the exam.
                  Students will need to enter their university ID to verify
                  access.
                </p>
              </div>

              <div className="flex items-center">
                <input
                  id="is_randomized"
                  name="is_randomized"
                  type="checkbox"
                  checked={examData.is_randomized}
                  onChange={(e) =>
                    setExamData((prev) => ({
                      ...prev,
                      is_randomized: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 text-slate-600 focus:ring-slate-500 border-slate-300 rounded"
                />
                <label
                  htmlFor="is_randomized"
                  className="ml-2 block text-sm text-slate-700"
                >
                  Randomize question order for each student
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6 border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">
              Student Access
            </h2>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Upload Student List (CSV){' '}
                <span className="text-red-600">*</span>
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="mt-1 block w-full text-slate-700"
                required
              />
              <p className="text-sm text-slate-500">
                Upload a CSV file containing the list of students allowed to
                take this exam.
              </p>
              <div className="mt-2 p-3 bg-slate-50 rounded-md border border-slate-200">
                <h3 className="text-sm font-medium text-slate-700 mb-1">
                  CSV Format:
                </h3>
                <p className="text-xs text-slate-600 mb-2">
                  Your CSV file should have the following columns:
                </p>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 border border-slate-200 rounded-md">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-700">
                          Column
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-700">
                          Description
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-700">
                          Example
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      <tr>
                        <td className="px-3 py-2 text-xs text-slate-700">
                          student_id
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-600">
                          University ID number
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-600">
                          12345678
                        </td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 text-xs text-slate-700">
                          email
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-600">
                          Student email address
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-600">
                          student@university.edu
                        </td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 text-xs text-slate-700">
                          name
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-600">
                          Student full name
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-600">
                          John Smith
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm ${
                isLoading
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-slate-700 hover:bg-slate-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500'
              }`}
            >
              {isLoading ? 'Creating Exam...' : 'Create Exam'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
