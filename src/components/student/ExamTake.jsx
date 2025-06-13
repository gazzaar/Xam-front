import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { studentService } from '../../services/api';

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
  const [hasWarned, setHasWarned] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  // Prevent double toast in StrictMode
  const hasShownInitialWarning = useRef(false);
  // Prevent double tab switch handling
  const tabSwitchLockRef = useRef(false);

  const submitExam = async () => {
    if (submitting) return;

    try {
      setSubmitting(true);
      await studentService.submitExam(examId, {
        examId,
        studentId: examSession.studentId,
      });

      toast.success(
        'Exam submitted successfully! Results will be available after the exam ends.'
      );
      sessionStorage.removeItem('examSession');
      navigate('/', { replace: true });
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

  // Show initial warning immediately when component mounts
  useEffect(() => {
    if (!hasShownInitialWarning.current) {
      toast(
        '⚠️ Exam Security Rules: Switching tabs or leaving this window is strictly prohibited. Any violation will be considered cheating.',
        {
          duration: 10000,
          style: {
            background: '#FEF3C7',
            color: '#92400E',
            border: '1px solid #F59E0B',
            padding: '16px',
            borderRadius: '8px',
          },
        }
      );
      hasShownInitialWarning.current = true;
    }
  }, []); // Empty dependency array ensures it only runs once on mount

  // Tab switch detection effect
  useEffect(() => {
    const handleTabSwitch = () => {
      if (tabSwitchLockRef.current) return;
      tabSwitchLockRef.current = true;
      setTimeout(() => {
        tabSwitchLockRef.current = false;
      }, 1000); // debounce for 1s

      if (!hasWarned) {
        setHasWarned(true);
        setShowWarning(true);
        toast.error(
          'WARNING: Tab switching detected! This is your only warning. Next violation will end your exam.',
          {
            duration: 6000,
            style: {
              background: '#FEF3C7',
              color: '#92400E',
              border: '1px solid #F59E0B',
            },
          }
        );
        setTimeout(() => {
          setShowWarning(false);
        }, 6000);
      } else {
        toast.error('Exam automatically submitted due to attempted cheating.', {
          duration: 5000,
          style: {
            background: '#FEE2E2',
            color: '#991B1B',
            border: '1px solid #DC2626',
          },
        });
        submitExam();
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleTabSwitch();
      }
    };

    window.addEventListener('blur', handleTabSwitch);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('blur', handleTabSwitch);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [hasWarned, submitExam]);

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
    if (examSession?.timeLimitMinutes && examSession?.startTime) {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const start = new Date(examSession.startTime).getTime();
        const duration = examSession.timeLimitMinutes * 60 * 1000; // convert minutes to milliseconds
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
      const response = await studentService.getExamQuestions(
        examId,
        session.studentId
      );

      console.log('Exam Questions Response:', response);

      if (
        !response.success ||
        !response.questions ||
        !Array.isArray(response.questions)
      ) {
        console.error('Invalid response format:', response);
        throw new Error('Invalid response format from server');
      }

      setExamSession((prev) => ({
        ...prev,
        ...response.exam,
      }));
      setQuestions(response.questions);
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

      await studentService.submitAnswer(examId, {
        examId,
        studentId: examSession.studentId,
        questionId,
        answer,
      });
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast.error('Failed to save answer');
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

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            No Questions Available
          </h2>
          <p className="text-slate-600">
            This exam has no questions available.
          </p>
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

  if (!currentQuestionData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Invalid Question
          </h2>
          <p className="text-slate-600">
            The current question data is invalid.
          </p>
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

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
          <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-lg shadow-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Academic Integrity Warning!
                </h3>
                <div className="mt-1 text-sm text-red-700">
                  <p>
                    Tab switching or leaving the exam window is considered
                    cheating. This is your ONLY warning. Next violation will
                    automatically submit your exam.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  {currentQuestionData.questionNumber || currentQuestion + 1}
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
            {currentQuestionData.image_url && (
              <div className="mt-4 mb-6 max-w-2xl mx-auto bg-white p-2 rounded-lg shadow-sm border border-slate-200">
                <div className="relative">
                  <img
                    src={getImageUrl(currentQuestionData.image_url)}
                    alt="Question Image"
                    className="rounded-lg object-contain w-full max-h-[400px]"
                    onError={(e) => {
                      console.error('Image failed to load:', e.target.src);
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
              </div>
            )}
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
            <div className="flex-1 mx-4 max-h-32 overflow-y-auto">
              <div className="flex flex-wrap justify-center gap-2">
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
