import React, { useEffect, useState } from 'react';
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
  const [showAddCourseForm, setShowAddCourseForm] = useState(false);
  const [showAddBankForm, setShowAddBankForm] = useState(false);
  const [showAddQuestionForm, setShowAddQuestionForm] = useState(false);
  const [showEditQuestionForm, setShowEditQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, type: '', id: null });
  const [questionFormData, setQuestionFormData] = useState({
    question_text: '',
    question_type: 'multiple-choice',
    options: [{ text: '', is_correct: false }],
    explanation: '',
    points: 1,
    image_url: '',
    chapter: '',
    difficulty: 'medium'
  });
  const [courseFormData, setCourseFormData] = useState({
    course_name: '',
    course_code: '',
    description: '',
  });
  const [bankFormData, setBankFormData] = useState({
    bank_name: '',
    description: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchCourses();
  }, [navigate]);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await instructorService.createCourse(courseFormData);
      setShowAddCourseForm(false);
      setCourseFormData({ course_name: '', course_code: '', description: '' });
      // Refresh courses list
      await fetchCourses();
      toast.success('Course created successfully');
    } catch (error) {
      console.error('Error creating Course:', error);
      toast.error(error.message || 'Failed to create Course');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
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
        difficulty: questionFormData.difficulty
      };
      
      await instructorService.addQuestionsToQuestionBank(selectedBank.question_bank_id, [questionData]);
      setShowAddQuestionForm(false);
      setQuestionFormData({
        question_text: '',
        question_type: 'multiple-choice',
        options: [{ text: '', is_correct: false }],
        explanation: '',
        points: 1,
        image_url: '',
        chapter: '',
        difficulty: 'medium'
      });
      // Refresh questions list
      await fetchQuestions(selectedBank.question_bank_id);
      toast.success('Question added successfully');
    } catch (error) {
      console.error('Error adding question:', error);
      toast.error(error.message || 'Failed to add question');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateQuestionBank = async (e) => {
    e.preventDefault();
    if (!selectedCourse) {
      toast.error('Please select a course first');
      return;
    }
    setIsLoading(true);
    try {
      // Pass course_id as a separate parameter and question bank data as an object
      await instructorService.createQuestionBank(
        selectedCourse.course_id,
        {
          bank_name: bankFormData.bank_name,
          description: bankFormData.description
        }
      );
      setShowAddBankForm(false);
      setBankFormData({ bank_name: '', description: '' });
      // Refresh question banks list
      await fetchQuestionBanks(selectedCourse.course_id);
      toast.success('Question bank created successfully');
    } catch (error) {
      console.error('Error creating question bank:', error);
      toast.error(error.message || 'Failed to create question bank');
    } finally {
      setIsLoading(false);
    }
  };

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

  const fetchQuestionBanks = async (courseId) => {
    try {
      const response = await instructorService.getQuestionBanksByCourse(courseId);
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
      const response = await instructorService.getQuestionsInQuestionBank(questionBankId);
      setQuestions(response);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Failed to fetch questions');
    }
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setSelectedBank(null);
    fetchQuestionBanks(course.course_id);
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
      is_correct: question.correct_answers?.[index] === true || question.correct_answers?.[index] === 't'
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
      difficulty: question.difficulty || 'medium'
    });
    setShowEditQuestionForm(true);
  };

  const handleUpdateQuestion = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Validate options - ensure each option has text
      const validOptions = questionFormData.options.filter(option => option.text.trim() !== '');
      
      if (validOptions.length === 0) {
        toast.error('Please add at least one option with text');
        setIsLoading(false);
        return;
      }
      
      // Ensure at least one option is marked as correct for multiple-choice
      if (questionFormData.question_type === 'multiple-choice' && 
          !validOptions.some(option => option.is_correct)) {
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
        difficulty: questionFormData.difficulty
      };
      
      console.log('Sending update data:', JSON.stringify(questionData, null, 2));
      
      await instructorService.updateQuestionInQuestionBank(selectedBank.question_bank_id, editingQuestion.question_id, questionData);
      setShowEditQuestionForm(false);
      setQuestionFormData({
        question_text: '',
        question_type: 'multiple-choice',
        options: [{ text: '', is_correct: false }],
        explanation: '',
        points: 1,
        image_url: '',
        chapter: '',
        difficulty: 'medium'
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
    // Add confirmation dialog
    if (!window.confirm(`Are you sure you want to delete this question: "${question.question_text}"?`)) {
      return; // User canceled the deletion
    }
    
    setIsLoading(true);
    try {
      await instructorService.deleteQuestionFromQuestionBank(selectedBank.question_bank_id, question.question_id);
      // Refresh questions list
      await fetchQuestions(selectedBank.question_bank_id);
      toast.success('Question deleted successfully');
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error(error.message || 'Failed to delete question');
    } finally {
      setIsLoading(false);
    }
  };

  // Add function to delete a question bank
  const handleDeleteQuestionBank = async (bankId) => {
    if (!bankId) return;
    
    setIsLoading(true);
    try {
      await instructorService.deleteQuestionBank(bankId);
      
      // Update the state to remove the deleted bank
      setQuestionBanks(prev => prev.filter(bank => bank.question_bank_id !== bankId));
      
      // If the deleted bank was selected, reset selection
      if (selectedBank && selectedBank.question_bank_id === bankId) {
        setSelectedBank(null);
        setQuestions([]);
      }
      
      toast.success('Question bank deleted successfully');
    } catch (error) {
      console.error('Error deleting question bank:', error);
      toast.error(error.response?.data?.error || 'Failed to delete question bank');
    } finally {
      setIsLoading(false);
      setDeleteConfirmation({ show: false, type: 'questionBank', id: bankId });
    }
  };
  
  // Add function to delete a course
  const handleDeleteCourse = async (courseId) => {
    if (!courseId) return;
    
    setIsLoading(true);
    try {
      await instructorService.deleteCourse(courseId);
      
      // Update the state to remove the deleted course
      setCourses(prev => prev.filter(course => course.course_id !== courseId));
      
      // If the deleted course was selected, reset selection
      if (selectedCourse && selectedCourse.course_id === courseId) {
        setSelectedCourse(null);
        setSelectedBank(null);
        setQuestionBanks([]);
        setQuestions([]);
      }
      
      toast.success('Course deleted successfully');
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error(error.response?.data?.error || 'Failed to delete course');
    } finally {
      setIsLoading(false);
      setDeleteConfirmation({ show: false, type: 'course', id: courseId });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-wrap">
        {/* Courses Panel */}
        <div className="w-full md:w-1/3 p-3">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-slate-800">Courses</h2>
              <button
                onClick={() => setShowAddCourseForm(true)}
                className="flex items-center px-3 py-1.5 bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors duration-200"
              >
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Course
              </button>
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
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-slate-800">{course.course_name}</h3>
                      <p className="text-sm text-slate-500">{course.course_code}</p>
                      {course.description && (
                        <p className="mt-2 text-sm text-slate-600 line-clamp-2">{course.description}</p>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmation({ show: true, type: 'course', id: course.course_id });
                      }}
                      className="text-red-500 hover:text-red-700 transition-colors duration-200 ml-2 flex-shrink-0"
                      title="Delete Course"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Question Banks Panel */}
        <div className="w-full md:w-1/3 p-3">
          <div className={`bg-white rounded-lg shadow-md p-6 mb-6 ${!selectedCourse ? 'opacity-75 pointer-events-none' : ''}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-slate-800">Question Banks</h2>
              <button
                onClick={() => setShowAddBankForm(true)}
                disabled={!selectedCourse}
                className="flex items-center px-3 py-1.5 bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors duration-200 disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Question Bank
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
                        <h3 className="font-medium text-slate-800">{bank.bank_name}</h3>
                        <p className="text-sm text-slate-500">Questions: {bank.question_count || 0}</p>
                        {bank.description && (
                          <p className="mt-2 text-sm text-slate-600 line-clamp-2">{bank.description}</p>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmation({ show: true, type: 'questionBank', id: bank.question_bank_id });
                        }}
                        className="text-red-500 hover:text-red-700 transition-colors duration-200 ml-2 flex-shrink-0"
                        title="Delete Question Bank"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
        <div className="w-full md:w-1/3 p-3">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-slate-800">Questions</h2>
              {selectedBank && (
                <button
                  onClick={() => setShowAddQuestionForm(true)}
                  className="flex items-center px-3 py-1.5 bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors duration-200"
                >
                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Question
                </button>
              )}
            </div>

            {/* Questions List */}
            <div className="space-y-3">
              {questions.map((question) => (
                <div
                  key={question.question_id}
                  className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  <div className="flex justify-between">
                    <p className="text-slate-900">{question.question_text}</p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditQuestion(question)}
                        className="text-slate-600 hover:text-slate-800"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(question)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {question.options && (
                    <div className="mt-2 space-y-1">
                      {question.options.map((option, index) => {
                        // Ensure we have a valid boolean value
                        const correctValue = question.correct_answers?.[index];
                        const isCorrect = correctValue === true || correctValue === 't';
                        
                        return (
                          <div key={index} className="flex items-center">
                            <span className={`w-4 h-4 rounded-full mr-2 ${
                              isCorrect ? 'bg-green-500' : 'bg-gray-300'
                            }`}></span>
                            <span className="text-sm text-slate-700">{option}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <p className="text-sm text-slate-500">Points: {question.points}</p>
                  {question.image_url && (
                    <p className="text-sm text-slate-500">Image URL: {question.image_url}</p>
                  )}
                  {question.chapter && (
                    <p className="text-sm text-slate-500">Chapter: {question.chapter}</p>
                  )}
                  {question.explanation && (
                    <p className="text-sm text-slate-500">Explanation: {question.explanation}</p>
                  )}
                  {question.difficulty && (
                    <p className="text-sm text-slate-500">Difficulty: {question.difficulty}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Question Modal */}
      {showAddQuestionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-slate-800">Add New Question</h3>
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
                    difficulty: 'medium'
                  });
                }}
                className="text-slate-400 hover:text-slate-500 transition-colors duration-200"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddQuestion} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Question Text</label>
                  <textarea
                    value={questionFormData.question_text}
                    onChange={(e) => setQuestionFormData({
                      ...questionFormData,
                      question_text: e.target.value
                    })}
                    rows={3}
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 py-2 px-3"
                    placeholder="Enter your question here..."
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Question Type</label>
                  <select
                    value={questionFormData.question_type}
                    onChange={(e) => {
                      const newType = e.target.value;
                      let newOptions = [...questionFormData.options];
                      
                      // If changing to true/false, set options to True and False
                      if (newType === 'true/false') {
                        newOptions = [
                          { text: 'True', is_correct: true },
                          { text: 'False', is_correct: false }
                        ];
                      } else if (newType === 'multiple-choice' && questionFormData.question_type === 'true/false') {
                        // If changing from true/false to multiple-choice, reset options
                        newOptions = [{ text: '', is_correct: false }];
                      }
                      
                      setQuestionFormData({
                        ...questionFormData,
                        question_type: newType,
                        options: newOptions
                      });
                    }}
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 py-2 px-3"
                  >
                    <option value="multiple-choice">Multiple Choice</option>
                    <option value="true/false">True/False</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Points</label>
                  <input
                    type="number"
                    min="1"
                    value={questionFormData.points}
                    onChange={(e) => setQuestionFormData({
                      ...questionFormData,
                      points: parseInt(e.target.value) || 1
                    })}
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 py-2 px-3"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Image URL (optional)</label>
                  <input
                    type="text"
                    value={questionFormData.image_url}
                    onChange={(e) => setQuestionFormData({
                      ...questionFormData,
                      image_url: e.target.value
                    })}
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 py-2 px-3"
                    placeholder="Enter image URL..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Chapter (optional)</label>
                  <input
                    type="text"
                    value={questionFormData.chapter}
                    onChange={(e) => setQuestionFormData({
                      ...questionFormData,
                      chapter: e.target.value
                    })}
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 py-2 px-3"
                    placeholder="e.g., Chapter 3"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Difficulty</label>
                  <select
                    value={questionFormData.difficulty}
                    onChange={(e) => setQuestionFormData({
                      ...questionFormData,
                      difficulty: e.target.value
                    })}
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 py-2 px-3"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Options</label>
                  <div className="space-y-3">
                    {questionFormData.question_type === 'true/false' ? (
                      // True/False options display
                      questionFormData.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-4">
                          <div className="flex-1">
                            <div className="relative">
                              <input
                                type="text"
                                value={option.text}
                                disabled
                                className="block w-full rounded-md border-slate-300 bg-slate-50 shadow-sm pl-10 py-2 px-3"
                              />
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-slate-500">{index + 1}.</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="radio"
                              name="correctAnswer"
                              checked={option.is_correct}
                              onChange={(e) => {
                                const newOptions = questionFormData.options.map((opt, i) => 
                                  ({ ...opt, is_correct: i === index })
                                );
                                setQuestionFormData({ ...questionFormData, options: newOptions });
                              }}
                              className="h-4 w-4 text-slate-600 focus:ring-slate-500 border-slate-300"
                            />
                            <label className="ml-2 text-sm text-slate-700">Correct</label>
                          </div>
                        </div>
                      ))
                    ) : (
                      // Multiple choice options
                      <>
                        {questionFormData.options.map((option, index) => (
                          <div key={index} className="flex items-center space-x-4">
                            <div className="flex-1">
                              <div className="relative">
                                <input
                                  type="text"
                                  value={option.text}
                                  onChange={(e) => {
                                    const newOptions = [...questionFormData.options];
                                    newOptions[index] = { ...option, text: e.target.value };
                                    setQuestionFormData({ ...questionFormData, options: newOptions });
                                  }}
                                  className="block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 pl-10 py-2 px-3"
                                  placeholder={`Option ${index + 1}`}
                                  required
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <span className="text-slate-500">{index + 1}.</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <input
                                type="radio"
                                name="correctAnswer"
                                checked={option.is_correct}
                                onChange={(e) => {
                                  const newOptions = questionFormData.options.map((opt, i) => 
                                    ({ ...opt, is_correct: i === index })
                                  );
                                  setQuestionFormData({ ...questionFormData, options: newOptions });
                                }}
                                className="h-4 w-4 text-slate-600 focus:ring-slate-500 border-slate-300"
                              />
                              <label className="ml-2 text-sm text-slate-700">Correct</label>
                            </div>
                            {index > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newOptions = questionFormData.options.filter((_, i) => i !== index);
                                  setQuestionFormData({ ...questionFormData, options: newOptions });
                                }}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
                              options: [...questionFormData.options, { text: '', is_correct: false }]
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Explanation (optional)</label>
                  <textarea
                    value={questionFormData.explanation}
                    onChange={(e) => setQuestionFormData({
                      ...questionFormData,
                      explanation: e.target.value
                    })}
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
                      difficulty: 'medium'
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
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-slate-800">Edit Question</h3>
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
                    difficulty: 'medium'
                  });
                }}
                className="text-slate-400 hover:text-slate-500 transition-colors duration-200"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpdateQuestion} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Question Text</label>
                  <textarea
                    value={questionFormData.question_text}
                    onChange={(e) => setQuestionFormData({
                      ...questionFormData,
                      question_text: e.target.value
                    })}
                    rows={3}
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 py-2 px-3"
                    placeholder="Enter your question here..."
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Question Type</label>
                  <select
                    value={questionFormData.question_type}
                    onChange={(e) => {
                      const newType = e.target.value;
                      let newOptions = [...questionFormData.options];
                      
                      // If changing to true/false, set options to True and False
                      if (newType === 'true/false') {
                        newOptions = [
                          { text: 'True', is_correct: true },
                          { text: 'False', is_correct: false }
                        ];
                      } else if (newType === 'multiple-choice' && questionFormData.question_type === 'true/false') {
                        // If changing from true/false to multiple-choice, reset options
                        newOptions = [{ text: '', is_correct: false }];
                      }
                      
                      setQuestionFormData({
                        ...questionFormData,
                        question_type: newType,
                        options: newOptions
                      });
                    }}
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 py-2 px-3"
                  >
                    <option value="multiple-choice">Multiple Choice</option>
                    <option value="true/false">True/False</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Points</label>
                  <input
                    type="number"
                    min="1"
                    value={questionFormData.points}
                    onChange={(e) => setQuestionFormData({
                      ...questionFormData,
                      points: parseInt(e.target.value) || 1
                    })}
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 py-2 px-3"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Image URL (optional)</label>
                  <input
                    type="text"
                    value={questionFormData.image_url}
                    onChange={(e) => setQuestionFormData({
                      ...questionFormData,
                      image_url: e.target.value
                    })}
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 py-2 px-3"
                    placeholder="Enter image URL..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Chapter (optional)</label>
                  <input
                    type="text"
                    value={questionFormData.chapter}
                    onChange={(e) => setQuestionFormData({
                      ...questionFormData,
                      chapter: e.target.value
                    })}
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 py-2 px-3"
                    placeholder="e.g., Chapter 3"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Difficulty</label>
                  <select
                    value={questionFormData.difficulty}
                    onChange={(e) => setQuestionFormData({
                      ...questionFormData,
                      difficulty: e.target.value
                    })}
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 py-2 px-3"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Options</label>
                  <div className="space-y-3">
                    {questionFormData.question_type === 'true/false' ? (
                      // True/False options display
                      questionFormData.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-4">
                          <div className="flex-1">
                            <div className="relative">
                              <input
                                type="text"
                                value={option.text}
                                disabled
                                className="block w-full rounded-md border-slate-300 bg-slate-50 shadow-sm pl-10 py-2 px-3"
                              />
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-slate-500">{index + 1}.</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="radio"
                              name="correctAnswer"
                              checked={option.is_correct}
                              onChange={(e) => {
                                const newOptions = questionFormData.options.map((opt, i) => 
                                  ({ ...opt, is_correct: i === index })
                                );
                                setQuestionFormData({ ...questionFormData, options: newOptions });
                              }}
                              className="h-4 w-4 text-slate-600 focus:ring-slate-500 border-slate-300"
                            />
                            <label className="ml-2 text-sm text-slate-700">Correct</label>
                          </div>
                        </div>
                      ))
                    ) : (
                      // Multiple choice options
                      <>
                        {questionFormData.options.map((option, index) => (
                          <div key={index} className="flex items-center space-x-4">
                            <div className="flex-1">
                              <div className="relative">
                                <input
                                  type="text"
                                  value={option.text}
                                  onChange={(e) => {
                                    const newOptions = [...questionFormData.options];
                                    newOptions[index] = { ...option, text: e.target.value };
                                    setQuestionFormData({ ...questionFormData, options: newOptions });
                                  }}
                                  className="block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 pl-10 py-2 px-3"
                                  placeholder={`Option ${index + 1}`}
                                  required
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <span className="text-slate-500">{index + 1}.</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <input
                                type="radio"
                                name="correctAnswer"
                                checked={option.is_correct}
                                onChange={(e) => {
                                  const newOptions = questionFormData.options.map((opt, i) => 
                                    ({ ...opt, is_correct: i === index })
                                  );
                                  setQuestionFormData({ ...questionFormData, options: newOptions });
                                }}
                                className="h-4 w-4 text-slate-600 focus:ring-slate-500 border-slate-300"
                              />
                              <label className="ml-2 text-sm text-slate-700">Correct</label>
                            </div>
                            {index > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newOptions = questionFormData.options.filter((_, i) => i !== index);
                                  setQuestionFormData({ ...questionFormData, options: newOptions });
                                }}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
                              options: [...questionFormData.options, { text: '', is_correct: false }]
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Explanation (optional)</label>
                  <textarea
                    value={questionFormData.explanation}
                    onChange={(e) => setQuestionFormData({
                      ...questionFormData,
                      explanation: e.target.value
                    })}
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

      {/* Add course Modal */}
      {showAddCourseForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Create New Course</h3>
              <button
                onClick={() => setShowAddCourseForm(false)}
                className="text-slate-400 hover:text-slate-500 transition-colors duration-200"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Course Name</label>
                <input
                  type="text"
                  value={courseFormData.course_name}
                  onChange={(e) => setCourseFormData(prev => ({ ...prev, course_name: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                    focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                  placeholder="e.g., Computer Science"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Course Code</label>
                <input
                  type="text"
                  value={courseFormData.course_code}
                  onChange={(e) => setCourseFormData(prev => ({ ...prev, course_code: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                    focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                  placeholder="e.g., CS101"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  value={courseFormData.description}
                  onChange={(e) => setCourseFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                    focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                  placeholder="Enter a brief description of the course"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddCourseForm(false)}
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
                  {isLoading ? 'Creating...' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Question Bank Modal */}
      {showAddBankForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Create New Question Bank</h3>
              <button
                onClick={() => setShowAddBankForm(false)}
                className="text-slate-400 hover:text-slate-500 transition-colors duration-200"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreateQuestionBank} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Bank Name</label>
                <input
                  type="text"
                  value={bankFormData.bank_name}
                  onChange={(e) => setBankFormData(prev => ({ ...prev, bank_name: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                    focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                  placeholder="e.g., Midterm Questions"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  value={bankFormData.description}
                  onChange={(e) => setBankFormData(prev => ({ ...prev, description: e.target.value }))}
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
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Confirm Deletion</h3>
              <p className="text-slate-600 mt-2">
                {deleteConfirmation.type === 'course' 
                  ? 'Are you sure you want to delete this course? This will also delete all associated question banks and questions.' 
                  : deleteConfirmation.type === 'questionBank'
                    ? 'Are you sure you want to delete this question bank? This will also delete all questions in this bank.'
                    : 'Are you sure you want to delete this item?'
                }
              </p>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setDeleteConfirmation({ show: false, type: '', id: null })}
                className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-gray-50
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (deleteConfirmation.type === 'course') {
                    handleDeleteCourse(deleteConfirmation.id);
                  } else if (deleteConfirmation.type === 'questionBank') {
                    handleDeleteQuestionBank(deleteConfirmation.id);
                  }
                }}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
