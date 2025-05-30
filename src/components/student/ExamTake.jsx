import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';

export default function ExamTake() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [examSession, setExamSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Get exam session data
    const sessionData = sessionStorage.getItem('examSession');
    if (!sessionData) {
      toast.error('No active exam session found');
      navigate('/', { replace: true });
      return;
    }

    try {
      const session = JSON.parse(sessionData);
      setExamSession(session);
      fetchExamQuestions(session);
    } catch {
      setError('Invalid session data');
      toast.error('Invalid session data');
      navigate('/', { replace: true });
    }
  }, [examId, navigate]);

  useEffect(() => {
    if (examSession?.duration && examSession?.startTime) {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const start = new Date(examSession.startTime).getTime();
        const duration = examSession.duration * 60 * 1000; // convert minutes to milliseconds
        const remaining = duration - (now - start);

        if (remaining <= 0) {
          clearInterval(timer);
          submitExam();
        } else {
          setTimeLeft(remaining);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [examSession]);

  const fetchExamQuestions = async (session) => {
    try {
      const response = await axios.post(
        `http://localhost:3000/api/student/exam/${examId}/questions`,
        {
          studentId: session.studentId,
        }
      );

      setExamSession((prev) => ({
        ...prev,
        ...response.data.exam,
      }));
      setQuestions(response.data.questions);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError(
        error.response?.data?.details ||
          error.response?.data?.error ||
          'Failed to fetch exam questions'
      );
      setLoading(false);
    }
  };

  const handleAnswer = async (questionId, answer) => {
    try {
      setAnswers((prev) => ({
        ...prev,
        [questionId]: answer,
      }));

      // Submit answer to backend
      await axios.post(
        `http://localhost:3000/api/student/exam/${examId}/answer`,
        {
          examId,
          studentId: examSession.studentId,
          questionId,
          answer,
        }
      );
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast.error('Failed to save answer');
    }
  };

  const submitExam = async () => {
    if (submitting) return;

    try {
      setSubmitting(true);
      const response = await axios.post(
        `http://localhost:3000/api/student/exam/${examId}/submit`,
        {
          examId,
          studentId: examSession.studentId,
        }
      );

      toast.success('Exam submitted successfully!');
      sessionStorage.removeItem('examSession');
      navigate('/exam-complete', {
        state: { score: response.data.score },
        replace: true,
      });
    } catch (error) {
      console.error('Error submitting exam:', error);
      toast.error(
        error.response?.data?.details ||
          error.response?.data?.error ||
          'Failed to submit exam'
      );
      setSubmitting(false);
    }
  };

  const formatTime = (ms) => {
    if (!ms) return '--:--:--';
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-700"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-slate-600">{error}</p>
          <button
            onClick={() => navigate('/', { replace: true })}
            className="mt-4 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const currentQuestionData = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="bg-white rounded-lg shadow-md p-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              {examSession?.examName}
            </h1>
            <p className="text-sm text-slate-600">
              Question {currentQuestion + 1} of {questions.length}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-mono text-slate-700">
              {formatTime(timeLeft)}
            </div>
            <p className="text-sm text-slate-500">Time Remaining</p>
          </div>
        </div>
      </div>

      {/* Question Area */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Question Text */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 text-sm font-semibold bg-slate-100 rounded-full text-slate-700">
                  {currentQuestionData.questionNumber}
                </span>
                <h2 className="text-xl font-semibold text-slate-800">
                  Question
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">Points:</span>
                <span className="px-3 py-1 bg-slate-100 rounded-full text-sm font-medium text-slate-700">
                  {currentQuestionData.points}
                </span>
              </div>
            </div>
            <p className="text-lg text-slate-700 leading-relaxed">
              {currentQuestionData.question_text}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-4">
            {currentQuestionData.options?.map((option) => {
              const isSelected =
                answers[currentQuestionData.question_id] ===
                option.option_id.toString();
              return (
                <label
                  key={option.option_id}
                  className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-slate-700 bg-slate-50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="relative flex items-center">
                    <input
                      type="radio"
                      name={`question-${currentQuestionData.question_id}`}
                      value={option.option_id}
                      checked={isSelected}
                      onChange={() =>
                        handleAnswer(
                          currentQuestionData.question_id,
                          option.option_id.toString()
                        )
                      }
                      className="w-5 h-5 border-2 border-slate-300 text-slate-700 focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 focus:outline-none transition-all duration-200"
                    />
                    <span
                      className={`ml-4 text-lg ${
                        isSelected
                          ? 'text-slate-900 font-medium'
                          : 'text-slate-700'
                      }`}
                    >
                      {option.option_text}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="mt-10 flex justify-between items-center">
            <button
              onClick={() => setCurrentQuestion((prev) => prev - 1)}
              disabled={currentQuestion === 0}
              className="px-6 py-2.5 border-2 border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Previous
            </button>
            <div className="flex space-x-2">
              {questions.map((_, index) => {
                const isAnswered = answers[questions[index].question_id];
                const isCurrent = currentQuestion === index;
                return (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestion(index)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                      isCurrent
                        ? 'bg-slate-700 text-white shadow-md'
                        : isAnswered
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
            {currentQuestion === questions.length - 1 ? (
              <button
                onClick={submitExam}
                disabled={submitting}
                className="px-6 py-2.5 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
              >
                {submitting ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
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
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  'Submit Exam'
                )}
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestion((prev) => prev + 1)}
                className="px-6 py-2.5 border-2 border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-all duration-200"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
