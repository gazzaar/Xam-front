import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';

export default function ExamStart() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [examSession, setExamSession] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    // Get exam session data
    const sessionData = sessionStorage.getItem('examSession');
    if (!sessionData) {
      toast.error('No active exam session found');
      navigate(`/exam/${examId}`);
      return;
    }

    setExamSession(JSON.parse(sessionData));
  }, [examId, navigate]);

  useEffect(() => {
    // Handle countdown for exam start
    if (isStarting && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isStarting && countdown === 0) {
      // Start the exam
      navigate(`/exam/${examId}/take`);
    }
  }, [countdown, isStarting, examId, navigate]);

  const handleStartExam = () => {
    setIsStarting(true);
  };

  if (!examSession) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-700"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-slate-200">
          {isStarting ? (
            <div className="p-8 text-center">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">
                Your exam will begin in {countdown} seconds
              </h2>
              <div className="animate-pulse">
                <div className="w-24 h-24 mx-auto rounded-full bg-slate-700 flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">
                    {countdown}
                  </span>
                </div>
              </div>
              <p className="mt-4 text-slate-600">
                Please do not close or refresh your browser
              </p>
            </div>
          ) : (
            <>
              <div className="p-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-slate-800">
                    Ready to Begin
                  </h2>
                  <p className="mt-2 text-slate-600">
                    Please review the information below before starting
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">
                      Exam Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-slate-600">
                          Student Name:
                        </span>
                        <p className="mt-1 text-slate-800">
                          {examSession.studentName}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-slate-600">
                          Student ID:
                        </span>
                        <p className="mt-1 text-slate-800">
                          {examSession.studentId}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-slate-600">
                          Duration:
                        </span>
                        <p className="mt-1 text-slate-800">
                          {examSession.duration} minutes
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                    <h3 className="text-lg font-semibold text-yellow-800 mb-4">
                      Important Instructions
                    </h3>
                    <ul className="list-disc list-inside space-y-2 text-yellow-700">
                      <li>
                        Do not refresh or close your browser during the exam
                      </li>
                      <li>
                        Ensure you have a stable internet connection before
                        starting
                      </li>
                      <li>
                        Your answers are automatically saved as you progress
                      </li>
                      <li>
                        You cannot return to previous questions once submitted
                      </li>
                      <li>
                        The exam will automatically submit when the time is up
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="px-8 py-6 bg-slate-50 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => navigate(`/exam/${examId}`)}
                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-500"
                  >
                    Go Back
                  </button>
                  <button
                    onClick={handleStartExam}
                    className="px-6 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
                  >
                    Start Exam
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
