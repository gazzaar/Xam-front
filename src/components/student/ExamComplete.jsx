import { useLocation, useNavigate } from 'react-router-dom';

export default function ExamComplete() {
  const location = useLocation();
  const navigate = useNavigate();
  const score = location.state?.score;

  if (!score && score !== 0) {
    navigate('/', { replace: true });
    return null;
  }

  // Convert score to number and handle any potential parsing issues
  const numericScore =
    typeof score === 'string' ? parseFloat(score) : Number(score);
  const displayScore = isNaN(numericScore) ? 0 : numericScore;

  // Function to handle navigation
  const handleNavigateHome = () => {
    // Clear any remaining exam session data
    sessionStorage.removeItem('examSession');
    // Navigate to landing page
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mb-6">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-12 h-12 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            Exam Completed!
          </h1>
          <p className="text-slate-600">
            Thank you for completing the exam. Here&apos;s your score:
          </p>
        </div>

        <div className="bg-slate-50 rounded-lg p-6 mb-6">
          <div className="text-4xl font-bold text-slate-800 mb-1">
            {displayScore.toFixed(1)}%
          </div>
          <p className="text-sm text-slate-500">Final Score</p>
        </div>

        <div className="text-sm text-slate-600">
          <p>Your responses have been recorded.</p>
          <p>You may now close this window.</p>
        </div>

        <button
          onClick={handleNavigateHome}
          className="mt-6 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors w-full"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
}
