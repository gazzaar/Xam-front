import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { examService } from '../../services/api';

const questionTypes = [
  { id: 'multiple-choice', label: 'Multiple Choice' },
  { id: 'true/false', label: 'True/False' },
  { id: 'short-answer', label: 'Short Answer' },
  { id: 'essay', label: 'Essay' },
];

export default function CreateExam() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [examData, setExamData] = useState({
    exam_name: '',
    description: '',
    start_date: '',
    end_date: '',
    duration: 60,
  });
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    type: 'multiple-choice',
    text: '',
    score: 1,
    order_num: 1,
    options: [
      { text: '', is_correct: false },
      { text: '', is_correct: false },
    ],
  });
  const [studentFile, setStudentFile] = useState(null);

  const handleExamDataChange = (e) => {
    const { name, value } = e.target;
    setExamData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleQuestionChange = (e) => {
    const { name, value } = e.target;
    setCurrentQuestion((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOptionChange = (index, field, value) => {
    setCurrentQuestion((prev) => {
      const newOptions = [...prev.options];
      if (field === 'is_correct') {
        // For multiple choice, only one option can be correct
        if (currentQuestion.type === 'multiple-choice') {
          newOptions.forEach((opt, i) => {
            opt.is_correct = i === index;
          });
        } else {
          newOptions[index].is_correct = value;
        }
      } else {
        newOptions[index] = {
          ...newOptions[index],
          [field]: value,
        };
      }
      return { ...prev, options: newOptions };
    });
  };

  const addOption = () => {
    setCurrentQuestion((prev) => ({
      ...prev,
      options: [...prev.options, { text: '', is_correct: false }],
    }));
  };

  const removeOption = (index) => {
    setCurrentQuestion((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const addQuestion = () => {
    setQuestions((prev) => [...prev, { ...currentQuestion }]);
    setCurrentQuestion({
      type: 'multiple-choice',
      text: '',
      score: 1,
      order_num: questions.length + 2,
      options: [
        { text: '', is_correct: false },
        { text: '', is_correct: false },
      ],
    });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      };

      // Step 1: Create exam
      const examResponse = await examService.createExam(formattedExamData);
      const examId = examResponse.data.exam_id;

      // Step 2: Add questions if any
      if (questions.length > 0) {
        await examService.addQuestions(examId, questions);
      }

      // Step 3: Upload student list if provided
      if (studentFile) {
        try {
          await examService.uploadStudents(examId, studentFile);
        } catch (uploadError) {
          console.error('Error uploading students:', uploadError);
          // Continue even if student upload fails
          setError(
            'Exam created but failed to upload student list. You can upload it later.'
          );
          navigate('/instructor/exams');
          return;
        }
      }

      navigate('/instructor/exams');
    } catch (err) {
      console.error('Error details:', err);
      setError(err.message || 'Failed to create exam');
    } finally {
      setIsLoading(false);
    }
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
    return true;
  };

  const validateQuestions = () => {
    if (questions.length === 0) {
      setError('Please add at least one question');
      return false;
    }
    return true;
  };

  const renderQuestionForm = () => {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Question Type
          </label>
          <select
            name="type"
            value={currentQuestion.type}
            onChange={handleQuestionChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          >
            {questionTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Question Text
          </label>
          <textarea
            name="text"
            value={currentQuestion.text}
            onChange={handleQuestionChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            rows="3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Score
          </label>
          <input
            type="number"
            name="score"
            value={currentQuestion.score}
            onChange={handleQuestionChange}
            min="1"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        {(currentQuestion.type === 'multiple-choice' ||
          currentQuestion.type === 'true/false') && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Options
            </label>
            {currentQuestion.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type={
                    currentQuestion.type === 'multiple-choice'
                      ? 'radio'
                      : 'checkbox'
                  }
                  checked={option.is_correct}
                  onChange={(e) =>
                    handleOptionChange(index, 'is_correct', e.target.checked)
                  }
                  className="h-4 w-4 text-slate-600"
                />
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) =>
                    handleOptionChange(index, 'text', e.target.value)
                  }
                  placeholder="Option text"
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2"
                />
                {currentQuestion.options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            {currentQuestion.type === 'multiple-choice' && (
              <button
                type="button"
                onClick={addOption}
                className="text-slate-600 hover:text-slate-800"
              >
                + Add Option
              </button>
            )}
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={addQuestion}
            className="rounded-md bg-slate-600 px-4 py-2 text-white hover:bg-slate-700"
          >
            Add Question
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-3xl font-bold">Create New Exam</h1>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="mb-8">
          <div className="flex justify-between">
            {[1, 2, 3].map((step) => (
              <button
                key={step}
                onClick={() => setCurrentStep(step)}
                className={`w-1/3 py-2 text-center ${
                  currentStep === step
                    ? 'border-b-2 border-slate-600 font-medium text-slate-600'
                    : 'text-gray-500'
                }`}
              >
                Step {step}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Exam Name
                </label>
                <input
                  type="text"
                  name="exam_name"
                  value={examData.exam_name}
                  onChange={handleExamDataChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={examData.description}
                  onChange={handleExamDataChange}
                  rows="3"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="datetime-local"
                    name="start_date"
                    value={examData.start_date}
                    onChange={handleExamDataChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    End Date
                  </label>
                  <input
                    type="datetime-local"
                    name="end_date"
                    value={examData.end_date}
                    onChange={handleExamDataChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  name="duration"
                  value={examData.duration}
                  onChange={handleExamDataChange}
                  min="1"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="mb-4">
                <h2 className="text-xl font-semibold">Questions</h2>
                <p className="text-sm text-gray-500">
                  Added questions: {questions.length}
                </p>
              </div>

              {questions.length > 0 && (
                <div className="mb-6 space-y-4">
                  <h3 className="font-medium">Added Questions:</h3>
                  {questions.map((q, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-gray-200 p-4"
                    >
                      <p className="font-medium">
                        {index + 1}. {q.text}
                      </p>
                      <p className="text-sm text-gray-500">
                        Type: {q.type}, Score: {q.score}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {renderQuestionForm()}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Upload Student List (CSV)
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="mt-1 block w-full"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Upload a CSV file containing the list of students allowed to
                  take this exam
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Previous
              </button>
            )}

            {currentStep < 3 && (
              <button
                type="button"
                onClick={() => {
                  if (currentStep === 1 && !validateExamData()) return;
                  if (currentStep === 2 && !validateQuestions()) return;
                  setCurrentStep(currentStep + 1);
                }}
                className="ml-auto rounded-md bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
              >
                Next
              </button>
            )}

            {currentStep === 3 && (
              <button
                type="submit"
                disabled={isLoading}
                className={`ml-auto rounded-md px-4 py-2 text-sm font-medium text-white ${
                  isLoading
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-slate-600 hover:bg-slate-700'
                }`}
              >
                {isLoading ? 'Creating Exam...' : 'Create Exam'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
