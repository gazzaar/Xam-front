import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { instructorService } from '../../services/api';

export default function QuestionBank() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [questionBanks, setQuestionBanks] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedBank, setSelectedBank] = useState(null);
  const [courseChapters, setCourseChapters] = useState([]);
  const [showAddBankForm, setShowAddBankForm] = useState(false);
  const [showAddQuestionForm, setShowAddQuestionForm] = useState(false);
  const [showEditQuestionForm, setShowEditQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    show: false,
    type: '',
    id: null,
    item: null,
  });
  const [questionFormData, setQuestionFormData] = useState({
    question_text: '',
    question_type: 'multiple-choice',
    options: [{ text: '', is_correct: false }],
    explanation: '',
    points: 1,
    image_url: '',
    chapter: '',
    difficulty: 'medium',
  });
  const [bankFormData, setBankFormData] = useState({
    bank_name: '',
    description: '',
  });
  const [showImportModal, setShowImportModal] = useState(false);
  const [importStatus, setImportStatus] = useState({
    loading: false,
    error: null,
    success: null,
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchCourses();
  }, [navigate]);

  const fetchCourses = async () => {
    try {
      const response = await instructorService.getCourses();
      setCourses(response);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to fetch courses');
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const handleCourseSelect = async (course) => {
    setSelectedCourse(course);
    setSelectedBank(null);
    try {
      const chapters = await instructorService.getChaptersForCourse(
        course.course_id
      );
      setCourseChapters(chapters);
      await fetchQuestionBanks(course.course_id);
    } catch (error) {
      console.error('Error fetching chapters:', error);
      toast.error('Failed to fetch course chapters');
    }
  };

  const handleBankSelect = async (bank) => {
    setSelectedBank(bank);
    try {
      await fetchQuestions(bank.question_bank_id);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Failed to fetch questions');
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const handleEditQuestion = (question) => {
    // Format options for the form - combine options text with correct_answers
    const formattedOptions = question.options.map((optionText, index) => ({
      text: optionText,
      is_correct:
        question.correct_answers?.[index] === true ||
        question.correct_answers?.[index] === 't',
    }));

    setEditingQuestion(question);
    setQuestionFormData({
      question_text: question.question_text,
      question_type: question.question_type,
      options: formattedOptions,
      explanation: question.explanation || '',
      points: question.points || 1,
      image_url: question.image_url || '',
      chapter: question.chapter || '',
      difficulty: question.difficulty || 'medium',
    });
    setShowEditQuestionForm(true);
  };

  const handleUpdateQuestion = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Validate options - ensure each option has text
      const validOptions = questionFormData.options.filter(
        (option) => option.text.trim() !== ''
      );

      if (validOptions.length === 0) {
        toast.error('Please add at least one option with text');
        setIsLoading(false);
        return;
      }

      // Ensure at least one option is marked as correct for multiple-choice
      if (
        questionFormData.question_type === 'multiple-choice' &&
        !validOptions.some((option) => option.is_correct)
      ) {
        toast.error('Please mark at least one option as correct');
        setIsLoading(false);
        return;
      }

      const questionData = {
        question_text: questionFormData.question_text,
        question_type: questionFormData.question_type,
        options: validOptions,
        explanation: questionFormData.explanation || '',
        points: parseInt(questionFormData.points) || 1,
        image_url: questionFormData.image_url || '',
        chapter: questionFormData.chapter || '',
        difficulty: questionFormData.difficulty,
      };

      await instructorService.updateQuestionInQuestionBank(
        selectedBank.question_bank_id,
        editingQuestion.question_id,
        questionData
      );
      setShowEditQuestionForm(false);
      setQuestionFormData({
        question_text: '',
        question_type: 'multiple-choice',
        options: [{ text: '', is_correct: false }],
        explanation: '',
        points: 1,
        image_url: '',
        chapter: '',
        difficulty: 'medium',
      });
      // Refresh questions list
      await fetchQuestions(selectedBank.question_bank_id);
      toast.success('Question updated successfully');
    } catch (error) {
      console.error('Error updating question:', error);
      toast.error(error.message || 'Failed to update question');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteQuestion = async (question) => {
    setDeleteConfirmation({
      show: true,
      type: 'question',
      id: question.question_id,
      item: question,
    });
  };

  const confirmDelete = async () => {
    const { type, id, item } = deleteConfirmation;
    setIsLoading(true);

    try {
      if (type === 'question') {
        await instructorService.deleteQuestionFromQuestionBank(
          selectedBank.question_bank_id,
          id
        );
        await fetchQuestions(selectedBank.question_bank_id);
        toast.success('Question deleted successfully');
      } else if (type === 'questionBank') {
        await handleDeleteQuestionBank(id);
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      toast.error(error.message, {
        duration: 6000,
      });
    } finally {
      setIsLoading(false);
      setDeleteConfirmation({ show: false, type: '', id: null, item: null });
    }
  };

  const handleAddQuestion = async (event) => {
    event.preventDefault();
    if (!selectedBank) {
      toast.error('Please select a question bank first');
      return;
    }
    setIsLoading(true);
    try {
      const questionData = {
        question_text: questionFormData.question_text,
        question_type: questionFormData.question_type,
        options: questionFormData.options,
        explanation: questionFormData.explanation,
        points: questionFormData.points,
        image_url: questionFormData.image_url,
        chapter: questionFormData.chapter,
        difficulty: questionFormData.difficulty,
      };

      await instructorService.addQuestionsToQuestionBank(
        selectedBank.question_bank_id,
        [questionData]
      );
      setShowAddQuestionForm(false);
      setQuestionFormData({
        question_text: '',
        question_type: 'multiple-choice',
        options: [{ text: '', is_correct: false }],
        explanation: '',
        points: 1,
        image_url: '',
        chapter: '',
        difficulty: 'medium',
      });
      await fetchQuestions(selectedBank.question_bank_id);
      toast.success('Question added successfully');
    } catch (error) {
      console.error('Error adding question:', error);
      toast.error(error.message || 'Failed to add question');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateQuestionBank = async (event) => {
    event.preventDefault();
    if (!selectedCourse) {
      toast.error('Please select a course first');
      return;
    }
    setIsLoading(true);
    try {
      await instructorService.createQuestionBank(selectedCourse.course_id, {
        bank_name: bankFormData.bank_name,
        description: bankFormData.description,
      });
      setShowAddBankForm(false);
      setBankFormData({ bank_name: '', description: '' });
      await fetchQuestionBanks(selectedCourse.course_id);
      toast.success('Question bank created successfully');
    } catch (error) {
      console.error('Error creating question bank:', error);
      toast.error(error.message || 'Failed to create question bank');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteQuestionBank = async (bankId) => {
    if (!bankId) return;

    setIsLoading(true);
    try {
      await instructorService.deleteQuestionBank(bankId);
      setQuestionBanks((prev) =>
        prev.filter((bank) => bank.question_bank_id !== bankId)
      );
      if (selectedBank && selectedBank.question_bank_id === bankId) {
        setSelectedBank(null);
        setQuestions([]);
      }
      toast.success('Question bank deleted successfully');
    } catch (error) {
      console.error('Error deleting question bank:', error);
      toast.error(error.message || 'Failed to delete question bank');
    } finally {
      setIsLoading(false);
      setDeleteConfirmation({ show: false, type: '', id: null, item: null });
    }
  };

  const fetchQuestionBanks = async (courseId) => {
    try {
      const response = await instructorService.getQuestionBanksByCourse(
        courseId
      );
      setQuestionBanks(response);
    } catch (error) {
      console.error('Error fetching question banks:', error);
      toast.error('Failed to fetch question banks');
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const fetchQuestions = async (questionBankId) => {
    try {
      const response = await instructorService.getQuestionsInQuestionBank(
        questionBankId
      );
      setQuestions(response);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Failed to fetch questions');
    }
  };

  const truncateUrl = (url) => {
    if (!url) return '';
    const maxLength = 40;
    if (url.length <= maxLength) return url;
    const start = url.substring(0, 20);
    const end = url.substring(url.length - 15);
    return `${start}...${end}`;
  };

  const getImageUrl = (url) => {
    if (!url) return '';

    // Check if it's a Google Drive URL
    if (url.includes('drive.google.com/file/d/')) {
      // Extract the file ID
      const matches = url.match(/\/d\/(.+?)\/view/);
      if (matches && matches[1]) {
        return `https://drive.google.com/uc?export=view&id=${matches[1]}`;
      }
    }

    return url;
  };

  const handleImportQuestions = async (event) => {
    event.preventDefault();
    const file = fileInputRef.current.files[0];

    if (!file) {
      toast.error('Please select a JSON file');
      return;
    }

    if (!selectedBank) {
      toast.error('Please select a question bank first');
      return;
    }

    setImportStatus({ loading: true, error: null, success: null });

    try {
      const result = await instructorService.importQuestionsFromJson(
        selectedBank.question_bank_id,
        file
      );

      setImportStatus({
        loading: false,
        error: null,
        success: `Successfully imported ${result.count} questions`,
      });

      // Refresh questions list
      await fetchQuestions(selectedBank.question_bank_id);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      toast.success(`Successfully imported ${result.count} questions`);
      setShowImportModal(false);
    } catch (error) {
      console.error('Error importing questions:', error);
      setImportStatus({
        loading: false,
        error: error.message || 'Failed to import questions',
        success: null,
      });
    }
  };

  const downloadSampleJson = () => {
    const sampleData = {
      questions: [
        {
          question_text: 'What is the capital of France?',
          question_type: 'multiple-choice',
          options: [
            { text: 'Paris', is_correct: true },
            { text: 'London', is_correct: false },
            { text: 'Berlin', is_correct: false },
            { text: 'Madrid', is_correct: false },
          ],
          explanation: 'Paris is the capital and largest city of France',
          points: 1,
          chapter: 'Chapter 1',
          difficulty: 'medium',
        },
        {
          question_text: 'Is the Earth flat?',
          question_type: 'true/false',
          options: [
            { text: 'True', is_correct: false },
            { text: 'False', is_correct: true },
          ],
          explanation: 'The Earth is approximately spherical in shape',
          points: 1,
          chapter: 'Chapter 1',
          difficulty: 'easy',
        },
      ],
    };

    const blob = new Blob([JSON.stringify(sampleData, null, 2)], {
      type: 'application/json',
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_questions.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-wrap -mx-2">
        {/* Courses Panel */}
        <div className="w-full md:w-1/3 px-2">
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-slate-800">Courses</h2>
            </div>

            <div className="space-y-3">
              {courses.map((course) => (
                <div
                  key={course.course_id}
                  onClick={() => handleCourseSelect(course)}
                  className={`relative p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedCourse?.course_id === course.course_id
                      ? 'border-slate-500 bg-slate-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <h3 className="font-medium text-slate-800">
                      {course.course_name}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {course.course_code}
                    </p>
                    {course.description && (
                      <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                        {course.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Question Banks Panel */}
        <div className="w-full md:w-1/3 px-2">
          <div
            className={`bg-white rounded-lg shadow-md p-4 mb-4 ${
              !selectedCourse ? 'opacity-75 pointer-events-none' : ''
            }`}
          >
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-slate-800">
                Question Banks
              </h2>
              <button
                onClick={() => setShowAddBankForm(true)}
                disabled={!selectedCourse}
                className="flex items-center px-2.5 py-1 text-sm bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors duration-200 disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                <svg
                  className="h-3.5 w-3.5 mr-1"
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
                Add Bank
              </button>
            </div>

            {selectedCourse ? (
              <div className="space-y-3">
                {questionBanks.map((bank) => (
                  <div
                    key={bank.question_bank_id}
                    onClick={() => handleBankSelect(bank)}
                    className={`relative p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedBank?.question_bank_id === bank.question_bank_id
                        ? 'border-slate-500 bg-slate-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-slate-800">
                          {bank.bank_name}
                        </h3>
                        <p className="text-sm text-slate-500">
                          Questions: {bank.total_questions || 0}
                        </p>
                        {bank.description && (
                          <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                            {bank.description}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmation({
                            show: true,
                            type: 'questionBank',
                            id: bank.question_bank_id,
                          });
                        }}
                        className="text-red-500 hover:text-red-700 transition-colors duration-200 ml-2 flex-shrink-0"
                        title="Delete Question Bank"
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
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                Please select a course to view question banks
              </div>
            )}
          </div>
        </div>

        {/* Questions Panel */}
        <div className="w-full md:w-1/3 px-2">
          <div className="bg-white rounded-lg shadow-md p-4 mb-4 h-[calc(100vh-2rem)]">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-slate-800">
                Questions
              </h2>
              {selectedBank && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowImportModal(true)}
                    className="flex items-center px-3 py-1.5 text-sm bg-white text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors duration-200 shadow-sm"
                  >
                    <svg
                      className="h-4 w-4 mr-1.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      />
                    </svg>
                    Import
                  </button>
                  <button
                    onClick={() => setShowAddQuestionForm(true)}
                    className="flex items-center px-3 py-1.5 text-sm bg-slate-700 text-white rounded-md hover:bg-slate-600 transition-colors duration-200 shadow-sm"
                  >
                    <svg
                      className="h-4 w-4 mr-1.5"
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
                    Add Question
                  </button>
                </div>
              )}
            </div>

            {/* Questions List */}
            <div className="overflow-y-auto h-[calc(100%-4rem)] pr-2 space-y-3">
              {questions.map((question) => (
                <div
                  key={question.question_id}
                  className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  <div className="flex justify-between">
                    <div className="flex-grow">
                      <p className="text-slate-900">{question.question_text}</p>
                      {question.image_url && (
                        <div className="mt-2 max-w-md">
                          <img
                            src={getImageUrl(question.image_url)}
                            alt="Question"
                            className="rounded-lg object-cover max-h-48 w-full"
                            onError={(e) => {
                              e.target.onerror = null;
                              // Create a simple error message div
                              const parent = e.target.parentElement;
                              const errorDiv = document.createElement('div');
                              errorDiv.className =
                                'p-4 text-center text-slate-500 bg-slate-50 rounded-lg';
                              errorDiv.innerHTML = 'Image could not be loaded';

                              // Hide the failed image and show the error message
                              e.target.style.display = 'none';
                              parent.appendChild(errorDiv);
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleEditQuestion(question)}
                        className="text-slate-600 hover:text-slate-800"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(question)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg
                          className="w-5 h-5"
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
                      </button>
                    </div>
                  </div>
                  {question.options && (
                    <div className="mt-2 space-y-1">
                      {question.options.map((option, index) => {
                        // Ensure we have a valid boolean value
                        const correctValue = question.correct_answers?.[index];
                        const isCorrect =
                          correctValue === true || correctValue === 't';

                        return (
                          <div key={index} className="flex items-center">
                            <span
                              className={`w-4 h-4 rounded-full mr-2 ${
                                isCorrect ? 'bg-green-500' : 'bg-gray-300'
                              }`}
                            ></span>
                            <span className="text-sm text-slate-700">
                              {option}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-slate-500">
                      Points: {question.points}
                    </p>
                    {question.image_url && (
                      <p className="text-sm text-slate-500 flex items-center">
                        <span className="mr-2">Image URL:</span>
                        <a
                          href={question.image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-600 truncate max-w-[300px]"
                          title={question.image_url}
                        >
                          {truncateUrl(question.image_url)}
                        </a>
                      </p>
                    )}
                    {question.chapter && (
                      <p className="text-sm text-slate-500">
                        Chapter: {question.chapter}
                      </p>
                    )}
                    {question.explanation && (
                      <p className="text-sm text-slate-500">
                        Explanation: {question.explanation}
                      </p>
                    )}
                    {question.difficulty && (
                      <p className="text-sm text-slate-500 flex items-center">
                        <span className="mr-2">Difficulty:</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            question.difficulty === 'easy'
                              ? 'bg-green-100 text-green-800'
                              : question.difficulty === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {question.difficulty.charAt(0).toUpperCase() +
                            question.difficulty.slice(1)}
                        </span>
                      </p>
                    )}
                    {question.created_by_first_name && (
                      <p className="text-sm text-slate-500">
                        Created by: {question.created_by_first_name}{' '}
                        {question.created_by_last_name}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Question Modal */}
      {showAddQuestionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-slate-800">
                Add New Question
              </h3>
              <button
                onClick={() => {
                  setShowAddQuestionForm(false);
                  setQuestionFormData({
                    question_text: '',
                    question_type: 'multiple-choice',
                    options: [{ text: '', is_correct: false }],
                    explanation: '',
                    points: 1,
                    image_url: '',
                    chapter: '',
                    difficulty: 'medium',
                  });
                }}
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

            <form onSubmit={handleAddQuestion} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Question Text
                  </label>
                  <textarea
                    value={questionFormData.question_text}
                    onChange={(e) =>
                      setQuestionFormData({
                        ...questionFormData,
                        question_text: e.target.value,
                      })
                    }
                    rows={3}
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 py-2 px-3"
                    placeholder="Enter your question here..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Question Type
                  </label>
                  <select
                    value={questionFormData.question_type}
                    onChange={(e) => {
                      const newType = e.target.value;
                      let newOptions = [...questionFormData.options];

                      // If changing to true/false, set options to True and False
                      if (newType === 'true/false') {
                        newOptions = [
                          { text: 'True', is_correct: true },
                          { text: 'False', is_correct: false },
                        ];
                      } else if (
                        newType === 'multiple-choice' &&
                        questionFormData.question_type === 'true/false'
                      ) {
                        // If changing from true/false to multiple-choice, reset options
                        newOptions = [{ text: '', is_correct: false }];
                      }

                      setQuestionFormData({
                        ...questionFormData,
                        question_type: newType,
                        options: newOptions,
                      });
                    }}
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 py-2 px-3"
                  >
                    <option value="multiple-choice">Multiple Choice</option>
                    <option value="true/false">True/False</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Points
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={questionFormData.points}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      const points = Math.min(Math.max(value, 1), 15);
                      setQuestionFormData({
                        ...questionFormData,
                        points: points,
                      });
                    }}
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 py-2 px-3"
                  />
                  <p className="mt-1 text-sm text-slate-500">
                    Points must be between 1 and 15
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Image URL (optional)
                  </label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={questionFormData.image_url}
                      onChange={(e) =>
                        setQuestionFormData({
                          ...questionFormData,
                          image_url: e.target.value,
                        })
                      }
                      className="block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 py-2 px-3"
                      placeholder="Enter image URL..."
                    />
                    {questionFormData.image_url && (
                      <div className="mt-2 max-w-md mx-auto">
                        <img
                          src={questionFormData.image_url}
                          alt="Question Preview"
                          className="rounded-lg object-cover max-h-48 w-full"
                          onError={(e) => {
                            e.target.onerror = null;
                            // Create a simple error message div
                            const parent = e.target.parentElement;
                            const errorDiv = document.createElement('div');
                            errorDiv.className =
                              'p-4 text-center text-slate-500 bg-slate-50 rounded-lg';
                            errorDiv.innerHTML = 'Image could not be loaded';

                            // Hide the failed image and show the error message
                            e.target.style.display = 'none';
                            parent.appendChild(errorDiv);
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Chapter
                  </label>
                  <select
                    value={questionFormData.chapter}
                    onChange={(e) =>
                      setQuestionFormData({
                        ...questionFormData,
                        chapter: e.target.value,
                      })
                    }
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 py-2 px-3"
                    required
                  >
                    <option value="">Select Chapter</option>
                    {courseChapters.map((chapter) => (
                      <option
                        key={chapter.chapter_id}
                        value={`Chapter ${chapter.chapter_number}`}
                      >
                        Chapter {chapter.chapter_number}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={questionFormData.difficulty}
                    onChange={(e) =>
                      setQuestionFormData({
                        ...questionFormData,
                        difficulty: e.target.value,
                      })
                    }
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 py-2 px-3"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Options
                  </label>
                  <div className="space-y-3">
                    {questionFormData.question_type === 'true/false' ? (
                      // True/False options display
                      questionFormData.options.map((option, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-4"
                        >
                          <div className="flex-1">
                            <div className="relative">
                              <input
                                type="text"
                                value={option.text}
                                disabled
                                className="block w-full rounded-md border-slate-300 bg-slate-50 shadow-sm pl-10 py-2 px-3"
                              />
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-slate-500">
                                  {index + 1}.
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="radio"
                              name="correctAnswer"
                              checked={option.is_correct}
                              onChange={() => {
                                const newOptions = questionFormData.options.map(
                                  (opt, i) => ({
                                    ...opt,
                                    is_correct: i === index,
                                  })
                                );
                                setQuestionFormData({
                                  ...questionFormData,
                                  options: newOptions,
                                });
                              }}
                              className="h-4 w-4 text-slate-600 focus:ring-slate-500 border-slate-300"
                            />
                            <label className="ml-2 text-sm text-slate-700">
                              Correct
                            </label>
                          </div>
                        </div>
                      ))
                    ) : (
                      // Multiple choice options
                      <>
                        {questionFormData.options.map((option, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-4"
                          >
                            <div className="flex-1">
                              <div className="relative">
                                <input
                                  type="text"
                                  value={option.text}
                                  onChange={(e) => {
                                    const newOptions = [
                                      ...questionFormData.options,
                                    ];
                                    newOptions[index] = {
                                      ...option,
                                      text: e.target.value,
                                    };
                                    setQuestionFormData({
                                      ...questionFormData,
                                      options: newOptions,
                                    });
                                  }}
                                  className="block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 pl-10 py-2 px-3"
                                  placeholder={`Option ${index + 1}`}
                                  required
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <span className="text-slate-500">
                                    {index + 1}.
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <input
                                type="radio"
                                name="correctAnswer"
                                checked={option.is_correct}
                                onChange={() => {
                                  const newOptions =
                                    questionFormData.options.map((opt, i) => ({
                                      ...opt,
                                      is_correct: i === index,
                                    }));
                                  setQuestionFormData({
                                    ...questionFormData,
                                    options: newOptions,
                                  });
                                }}
                                className="h-4 w-4 text-slate-600 focus:ring-slate-500 border-slate-300"
                              />
                              <label className="ml-2 text-sm text-slate-700">
                                Correct
                              </label>
                            </div>
                            {index > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newOptions =
                                    questionFormData.options.filter(
                                      (_, i) => i !== index
                                    );
                                  setQuestionFormData({
                                    ...questionFormData,
                                    options: newOptions,
                                  });
                                }}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <svg
                                  className="w-5 h-5"
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
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            setQuestionFormData({
                              ...questionFormData,
                              options: [
                                ...questionFormData.options,
                                { text: '', is_correct: false },
                              ],
                            });
                          }}
                          className="mt-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-colors duration-200"
                        >
                          Add Option
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Explanation (optional)
                  </label>
                  <textarea
                    value={questionFormData.explanation}
                    onChange={(e) =>
                      setQuestionFormData({
                        ...questionFormData,
                        explanation: e.target.value,
                      })
                    }
                    rows={2}
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 py-2 px-3"
                    placeholder="Enter explanation..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddQuestionForm(false);
                    setQuestionFormData({
                      question_text: '',
                      question_type: 'multiple-choice',
                      options: [{ text: '', is_correct: false }],
                      explanation: '',
                      points: 1,
                      image_url: '',
                      chapter: '',
                      difficulty: 'medium',
                    });
                  }}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-slate-700 rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all duration-200"
                >
                  Add Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Question Modal */}
      {showEditQuestionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-slate-800">
                Edit Question
              </h3>
              <button
                onClick={() => {
                  setShowEditQuestionForm(false);
                  setQuestionFormData({
                    question_text: '',
                    question_type: 'multiple-choice',
                    options: [{ text: '', is_correct: false }],
                    explanation: '',
                    points: 1,
                    image_url: '',
                    chapter: '',
                    difficulty: 'medium',
                  });
                }}
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

            <form onSubmit={handleUpdateQuestion} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Question Text
                  </label>
                  <textarea
                    value={questionFormData.question_text}
                    onChange={(e) =>
                      setQuestionFormData({
                        ...questionFormData,
                        question_text: e.target.value,
                      })
                    }
                    rows={3}
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 py-2 px-3"
                    placeholder="Enter your question here..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Question Type
                  </label>
                  <select
                    value={questionFormData.question_type}
                    onChange={(e) => {
                      const newType = e.target.value;
                      let newOptions = [...questionFormData.options];

                      // If changing to true/false, set options to True and False
                      if (newType === 'true/false') {
                        newOptions = [
                          { text: 'True', is_correct: true },
                          { text: 'False', is_correct: false },
                        ];
                      } else if (
                        newType === 'multiple-choice' &&
                        questionFormData.question_type === 'true/false'
                      ) {
                        // If changing from true/false to multiple-choice, reset options
                        newOptions = [{ text: '', is_correct: false }];
                      }

                      setQuestionFormData({
                        ...questionFormData,
                        question_type: newType,
                        options: newOptions,
                      });
                    }}
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 py-2 px-3"
                  >
                    <option value="multiple-choice">Multiple Choice</option>
                    <option value="true/false">True/False</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Points
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={questionFormData.points}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      const points = Math.min(Math.max(value, 1), 15);
                      setQuestionFormData({
                        ...questionFormData,
                        points: points,
                      });
                    }}
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 py-2 px-3"
                  />
                  <p className="mt-1 text-sm text-slate-500">
                    Points must be between 1 and 15
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Image URL (optional)
                  </label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={questionFormData.image_url}
                      onChange={(e) =>
                        setQuestionFormData({
                          ...questionFormData,
                          image_url: e.target.value,
                        })
                      }
                      className="block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 py-2 px-3"
                      placeholder="Enter image URL..."
                    />
                    {questionFormData.image_url && (
                      <div className="mt-2 max-w-md mx-auto">
                        <img
                          src={questionFormData.image_url}
                          alt="Question Preview"
                          className="rounded-lg object-cover max-h-48 w-full"
                          onError={(e) => {
                            e.target.onerror = null;
                            // Create a simple error message div
                            const parent = e.target.parentElement;
                            const errorDiv = document.createElement('div');
                            errorDiv.className =
                              'p-4 text-center text-slate-500 bg-slate-50 rounded-lg';
                            errorDiv.innerHTML = 'Image could not be loaded';

                            // Hide the failed image and show the error message
                            e.target.style.display = 'none';
                            parent.appendChild(errorDiv);
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Chapter
                  </label>
                  <select
                    value={questionFormData.chapter}
                    onChange={(e) =>
                      setQuestionFormData({
                        ...questionFormData,
                        chapter: e.target.value,
                      })
                    }
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 py-2 px-3"
                    required
                  >
                    <option value="">Select Chapter</option>
                    {courseChapters.map((chapter) => (
                      <option
                        key={chapter.chapter_id}
                        value={`Chapter ${chapter.chapter_number}`}
                      >
                        Chapter {chapter.chapter_number}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={questionFormData.difficulty}
                    onChange={(e) =>
                      setQuestionFormData({
                        ...questionFormData,
                        difficulty: e.target.value,
                      })
                    }
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 py-2 px-3"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Options
                  </label>
                  <div className="space-y-3">
                    {questionFormData.question_type === 'true/false' ? (
                      // True/False options display
                      questionFormData.options.map((option, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-4"
                        >
                          <div className="flex-1">
                            <div className="relative">
                              <input
                                type="text"
                                value={option.text}
                                disabled
                                className="block w-full rounded-md border-slate-300 bg-slate-50 shadow-sm pl-10 py-2 px-3"
                              />
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-slate-500">
                                  {index + 1}.
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="radio"
                              name="correctAnswer"
                              checked={option.is_correct}
                              onChange={() => {
                                const newOptions = questionFormData.options.map(
                                  (opt, i) => ({
                                    ...opt,
                                    is_correct: i === index,
                                  })
                                );
                                setQuestionFormData({
                                  ...questionFormData,
                                  options: newOptions,
                                });
                              }}
                              className="h-4 w-4 text-slate-600 focus:ring-slate-500 border-slate-300"
                            />
                            <label className="ml-2 text-sm text-slate-700">
                              Correct
                            </label>
                          </div>
                        </div>
                      ))
                    ) : (
                      // Multiple choice options
                      <>
                        {questionFormData.options.map((option, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-4"
                          >
                            <div className="flex-1">
                              <div className="relative">
                                <input
                                  type="text"
                                  value={option.text}
                                  onChange={(e) => {
                                    const newOptions = [
                                      ...questionFormData.options,
                                    ];
                                    newOptions[index] = {
                                      ...option,
                                      text: e.target.value,
                                    };
                                    setQuestionFormData({
                                      ...questionFormData,
                                      options: newOptions,
                                    });
                                  }}
                                  className="block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 pl-10 py-2 px-3"
                                  placeholder={`Option ${index + 1}`}
                                  required
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <span className="text-slate-500">
                                    {index + 1}.
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <input
                                type="radio"
                                name="correctAnswer"
                                checked={option.is_correct}
                                onChange={() => {
                                  const newOptions =
                                    questionFormData.options.map((opt, i) => ({
                                      ...opt,
                                      is_correct: i === index,
                                    }));
                                  setQuestionFormData({
                                    ...questionFormData,
                                    options: newOptions,
                                  });
                                }}
                                className="h-4 w-4 text-slate-600 focus:ring-slate-500 border-slate-300"
                              />
                              <label className="ml-2 text-sm text-slate-700">
                                Correct
                              </label>
                            </div>
                            {index > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newOptions =
                                    questionFormData.options.filter(
                                      (_, i) => i !== index
                                    );
                                  setQuestionFormData({
                                    ...questionFormData,
                                    options: newOptions,
                                  });
                                }}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <svg
                                  className="w-5 h-5"
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
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            setQuestionFormData({
                              ...questionFormData,
                              options: [
                                ...questionFormData.options,
                                { text: '', is_correct: false },
                              ],
                            });
                          }}
                          className="mt-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-colors duration-200"
                        >
                          Add Option
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Explanation (optional)
                  </label>
                  <textarea
                    value={questionFormData.explanation}
                    onChange={(e) =>
                      setQuestionFormData({
                        ...questionFormData,
                        explanation: e.target.value,
                      })
                    }
                    rows={2}
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 py-2 px-3"
                    placeholder="Enter explanation..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditQuestionForm(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-slate-700 rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all duration-200"
                >
                  Update Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Question Bank Modal */}
      {showAddBankForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-slate-800">
                Create New Question Bank
              </h3>
              <button
                onClick={() => setShowAddBankForm(false)}
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
            <form onSubmit={handleCreateQuestionBank} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={bankFormData.bank_name}
                  onChange={(e) =>
                    setBankFormData((prev) => ({
                      ...prev,
                      bank_name: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                    focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                  placeholder="e.g., Midterm Questions"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  value={bankFormData.description}
                  onChange={(e) =>
                    setBankFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                    focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                  placeholder="Enter a brief description of the question bank"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddBankForm(false)}
                  className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-gray-50
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-700 hover:bg-slate-600
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : 'Create Bank'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 transform transition-all">
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">
                  Confirm Deletion
                </h3>
                <button
                  onClick={() =>
                    setDeleteConfirmation({
                      show: false,
                      type: '',
                      id: null,
                      item: null,
                    })
                  }
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

              <div className="mt-4">
                {deleteConfirmation.type === 'question' ? (
                  <>
                    <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-4">
                      <p className="text-sm font-medium">
                        Are you sure you want to delete this question?
                      </p>
                      {deleteConfirmation.item && (
                        <div className="mt-2 text-sm text-red-700">
                          <p className="font-semibold">Question:</p>
                          <p className="mt-1">
                            {deleteConfirmation.item.question_text}
                          </p>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">
                      This action cannot be undone. The question will be
                      permanently removed from this question bank.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-4">
                      <p className="text-sm font-medium">
                        Are you sure you want to delete this question bank?
                      </p>
                      <p className="mt-2 text-sm">
                        All questions in this bank will be permanently deleted.
                      </p>
                    </div>
                    <p className="text-sm text-slate-600">
                      This action cannot be undone. All questions in this bank
                      will be permanently removed.
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() =>
                  setDeleteConfirmation({
                    show: false,
                    type: '',
                    id: null,
                    item: null,
                  })
                }
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 flex items-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4 mr-1.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Delete{' '}
                    {deleteConfirmation.type === 'question'
                      ? 'Question'
                      : 'Question Bank'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Questions Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-800">
                Import Questions
              </h3>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportStatus({
                    loading: false,
                    error: null,
                    success: null,
                  });
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
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

            <div className="mb-4">
              <p className="text-sm text-slate-600 mb-2">
                Upload a JSON file containing questions to import. The file
                should follow the required format.
              </p>
              <button
                onClick={downloadSampleJson}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Download sample JSON template
              </button>
            </div>

            <form onSubmit={handleImportQuestions} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  JSON File
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="application/json"
                  className="block w-full text-sm text-slate-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-medium
                    file:bg-slate-50 file:text-slate-700
                    hover:file:bg-slate-100
                    focus:outline-none"
                  required
                />
              </div>

              {importStatus.error && (
                <div className="text-sm text-red-600 bg-red-50 rounded-md p-3">
                  {importStatus.error}
                </div>
              )}

              {importStatus.success && (
                <div className="text-sm text-green-600 bg-green-50 rounded-md p-3">
                  {importStatus.success}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowImportModal(false);
                    setImportStatus({
                      loading: false,
                      error: null,
                      success: null,
                    });
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
                  disabled={importStatus.loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-slate-700 rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
                  disabled={importStatus.loading}
                >
                  {importStatus.loading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Importing...
                    </span>
                  ) : (
                    'Import Questions'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
