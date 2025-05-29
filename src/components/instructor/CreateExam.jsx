import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { examService, instructorService } from '../../services/api';

export default function CreateExam() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [courses, setCourses] = useState([]);
  const [questionBanks, setQuestionBanks] = useState([]);
  const [bankStats, setBankStats] = useState({
    totalQuestions: 0,
    chapterStats: {},
  });
  const [selectedChapters, setSelectedChapters] = useState(new Set());
  const [examData, setExamData] = useState({
    exam_name: '',
    description: '',
    exam_date: '',
    start_time: '',
    end_time: '',
    duration: 60,
    exam_link_id: generateRandomCode(8),
    is_randomized: true,
    course_id: '',
    question_bank_id: '',
    total_questions: 20,
    chapterDistribution: [],
    difficultyDistribution: {
      easy: 30,
      medium: 50,
      hard: 20,
    },
  });
  const [studentFile, setStudentFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

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

  const fetchBankStats = async (bankId) => {
    if (!bankId) return;

    try {
      const response = await instructorService.getQuestionBankStats(bankId);
      setBankStats(response);

      // Update total questions to match bank total
      setExamData((prev) => ({
        ...prev,
        total_questions: response.totalQuestions,
        // Reset chapter distribution when changing banks
        chapterDistribution: [],
      }));

      // Reset selected chapters
      setSelectedChapters(new Set());
    } catch (error) {
      console.error('Error fetching bank statistics:', error);
      setError('Failed to fetch question bank statistics');
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

  // Add validation functions
  const validateTimeRange = (date, startTime, endTime, duration) => {
    if (!date || !startTime || !endTime) return false;

    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const examDate = new Date(date);
    const startDateTime = new Date(examDate);
    startDateTime.setHours(startHour, startMinute);

    const endDateTime = new Date(examDate);
    endDateTime.setHours(endHour, endMinute);

    // Calculate duration in minutes
    const durationInMinutes = (endDateTime - startDateTime) / (1000 * 60);

    return {
      isValid: durationInMinutes >= duration,
      actualDuration: durationInMinutes,
    };
  };

  const validateDifficultyDistribution = () => {
    const { easy, medium, hard } = examData.difficultyDistribution;
    const total = easy + medium + hard;
    return total === 100;
  };

  const validateChapterDistribution = () => {
    const totalQuestions = examData.chapterDistribution.reduce(
      (sum, chapter) => sum + Number(chapter.questionCount),
      0
    );
    return totalQuestions === Number(examData.total_questions);
  };

  const handleExamDataChange = (e) => {
    const { name, value } = e.target;

    if (name === 'course_id') {
      fetchQuestionBanks(value);
      setExamData((prev) => ({
        ...prev,
        [name]: value,
        question_bank_id: '',
        total_questions: 0,
        chapterDistribution: [],
      }));
      setBankStats({ totalQuestions: 0, chapterStats: {} });
      setSelectedChapters(new Set());
    } else if (name === 'question_bank_id') {
      fetchBankStats(value);
      setExamData((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else if (name === 'total_questions') {
      const newValue = Math.min(parseInt(value) || 0, bankStats.totalQuestions);
      setExamData((prev) => ({
        ...prev,
        [name]: newValue,
      }));
    } else {
      setExamData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleChapterChange = (index, field, value) => {
    if (field === 'chapter') {
      // Remove old chapter from selected set
      const oldChapter = examData.chapterDistribution[index]?.chapter;
      if (oldChapter) {
        const newSelected = new Set(selectedChapters);
        newSelected.delete(oldChapter);
        setSelectedChapters(newSelected);
      }

      // Add new chapter to selected set
      if (value) {
        const newSelected = new Set(selectedChapters);
        newSelected.add(value);
        setSelectedChapters(newSelected);
      }
    }

    setExamData((prev) => {
      const newDistribution = [...prev.chapterDistribution];
      if (field === 'questionCount') {
        // Ensure count doesn't exceed available questions for the chapter
        const chapter = newDistribution[index].chapter;
        const maxQuestions = bankStats.chapterStats[chapter]?.count || 0;
        value = Math.min(parseInt(value) || 0, maxQuestions);
      }

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
        { chapter: '', questionCount: 0 },
      ],
    }));
  };

  const removeChapter = (index) => {
    setExamData((prev) => {
      const newDistribution = [...prev.chapterDistribution];
      const removedChapter = newDistribution[index].chapter;

      // Remove the chapter from selected chapters
      if (removedChapter) {
        const newSelected = new Set(selectedChapters);
        newSelected.delete(removedChapter);
        setSelectedChapters(newSelected);
      }

      // Remove the chapter from distribution
      newDistribution.splice(index, 1);
      return {
        ...prev,
        chapterDistribution: newDistribution,
      };
    });
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type !== 'text/csv') {
        setError('Please upload a CSV file');
        return;
      }
      setStudentFile(file);
    }
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
    // Required fields validation
    const requiredFields = {
      exam_name: 'Exam Name',
      description: 'Description',
      exam_date: 'Exam Date',
      start_time: 'Start Time',
      end_time: 'End Time',
      duration: 'Duration',
      course_id: 'Course',
      question_bank_id: 'Question Bank',
    };

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!examData[field]) {
        setError(`${label} is required`);
        return false;
      }
    }

    // Time range validation
    const timeValidation = validateTimeRange(
      examData.exam_date,
      examData.start_time,
      examData.end_time,
      examData.duration
    );

    if (!timeValidation.isValid) {
      setError(
        `Duration (${
          examData.duration
        } minutes) exceeds available time (${Math.floor(
          timeValidation.actualDuration
        )} minutes)`
      );
      return false;
    }

    // Validate exam date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const examDate = new Date(examData.exam_date);
    if (examDate < today) {
      setError('Exam date cannot be in the past');
      return false;
    }

    // Validate duration
    if (examData.duration < 1) {
      setError('Duration must be at least 1 minute');
      return false;
    }

    // Validate chapter distribution
    if (!validateChapterDistribution()) {
      setError(
        'Total questions in chapter distribution must match total questions specified'
      );
      return false;
    }

    // Validate difficulty distribution
    if (!validateDifficultyDistribution()) {
      setError('Difficulty distribution must add up to 100%');
      return false;
    }

    // Validate student file
    if (!studentFile) {
      setError('Please upload a CSV file with the list of students');
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
      // Combine date and time for API
      const examDate = new Date(examData.exam_date);
      const [startHour, startMinute] = examData.start_time
        .split(':')
        .map(Number);
      const [endHour, endMinute] = examData.end_time.split(':').map(Number);

      const startDateTime = new Date(examDate);
      startDateTime.setHours(startHour, startMinute);

      const endDateTime = new Date(examDate);
      endDateTime.setHours(endHour, endMinute);

      const formattedExamData = {
        ...examData,
        start_date: startDateTime.toISOString(),
        end_date: endDateTime.toISOString(),
        chapterDistribution: examData.chapterDistribution.map((item) => ({
          chapter: item.chapter,
          count: parseInt(item.questionCount),
        })),
        difficultyDistribution: examData.difficultyDistribution,
        course_id: examData.course_id,
        question_bank_id: examData.question_bank_id,
        total_questions: parseInt(examData.total_questions),
      };

      // Create the exam
      const examResponse = await examService.createExam(formattedExamData);

      if (examResponse && examResponse.exam_id) {
        // Upload student list
        try {
          await examService.uploadAllowedStudents(
            examResponse.exam_id,
            studentFile
          );
          toast.success('Exam created and student list uploaded successfully');
          navigate('/instructor/exams');
        } catch (uploadError) {
          console.error('Error uploading student list:', uploadError);
          setError(
            'Exam created but failed to upload student list: ' +
              (uploadError.message || 'Unknown error')
          );
        }
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Exam Date <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    name="exam_date"
                    value={examData.exam_date}
                    onChange={handleExamDataChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:ring-slate-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Start Time <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="time"
                    name="start_time"
                    value={examData.start_time}
                    onChange={handleExamDataChange}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:ring-slate-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    End Time <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="time"
                    name="end_time"
                    value={examData.end_time}
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
                        {bank.bank_name} ({bank.total_questions} questions)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Total Questions <span className="text-red-600">*</span>
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    name="total_questions"
                    value={examData.total_questions}
                    onChange={handleExamDataChange}
                    min="1"
                    max={bankStats.totalQuestions}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                      focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                    required
                  />
                  <span className="text-sm text-slate-500">
                    Max: {bankStats.totalQuestions}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Chapter Distribution <span className="text-red-600">*</span>
                </label>
                <div className="space-y-3">
                  {examData.chapterDistribution.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <select
                        value={item.chapter}
                        onChange={(e) =>
                          handleChapterChange(index, 'chapter', e.target.value)
                        }
                        className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                          focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                      >
                        <option value="">Select chapter</option>
                        {Object.entries(bankStats.chapterStats || {}).map(
                          ([chapter, stats]) =>
                            !selectedChapters.has(chapter) ||
                            item.chapter === chapter ? (
                              <option key={chapter} value={chapter}>
                                {chapter} ({stats.count} questions)
                              </option>
                            ) : null
                        )}
                      </select>
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
                        min="0"
                        max={bankStats.chapterStats[item.chapter]?.count || 0}
                        className="w-24 px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                          focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                      />
                      <span className="text-sm text-slate-500 w-20">
                        Max: {bankStats.chapterStats[item.chapter]?.count || 0}
                      </span>
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

              <div
                className={`relative mt-2 flex justify-center rounded-lg border-2 border-dashed px-6 py-10
                  ${
                    dragActive
                      ? 'border-slate-400 bg-slate-50'
                      : 'border-slate-300'
                  }
                  ${studentFile ? 'bg-slate-50' : 'bg-white'}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="text-center">
                  {!studentFile ? (
                    <>
                      <svg
                        className="mx-auto h-12 w-12 text-slate-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <div className="mt-4 flex text-sm leading-6 text-slate-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer rounded-md font-semibold text-slate-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-slate-500 focus-within:ring-offset-2 hover:text-slate-500"
                        >
                          <span>Click to upload</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            accept=".csv"
                            className="sr-only"
                            onChange={handleFileChange}
                            required
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs leading-5 text-slate-600">
                        CSV file up to 10MB
                      </p>
                    </>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <svg
                        className="h-8 w-8 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div className="flex flex-col items-start">
                        <p className="text-sm font-medium text-slate-900">
                          {studentFile.name}
                        </p>
                        <button
                          type="button"
                          onClick={() => setStudentFile(null)}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Remove file
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

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
