import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';

const ExamPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [sampleQuestions, setSampleQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchExamPreview();
  }, [id]);

  const fetchExamPreview = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:3000/api/instructor/exams/${id}/preview`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Exam preview data:', response.data);

      if (response.data) {
        setExam(response.data.exam);
        setSampleQuestions(response.data.sampleQuestions || []);
      } else {
        setError('Failed to load exam preview');
      }
    } catch (err) {
      console.error('Error fetching exam preview:', err);
      setError(err.message || 'Failed to load exam preview');
      toast.error(err.message || 'Failed to load exam preview');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="text-red-700 font-medium">
          Error loading exam preview
        </div>
        <div className="text-red-600 font-medium">{error}</div>
        <button
          onClick={() => navigate('/instructor/exams')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-bold"
        >
          Back to Exams
        </button>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="bg-yellow-50 p-4 rounded-md">
        <div className="text-yellow-700 font-medium">Exam not found</div>
        <button
          onClick={() => navigate('/instructor/exams')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-bold"
        >
          Back to Exams
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {exam.exam_name} - Preview
        </h1>
        <button
          onClick={() => navigate('/instructor/exams')}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Back to Exams
        </button>
      </div>

      <div className="bg-blue-50 p-4 rounded-md mb-6">
        <div className="text-blue-700 font-medium">
          This is a preview of how the exam will appear to students
        </div>
        <div className="text-blue-600 text-sm font-medium">
          Note: Each student will receive a unique set of questions based on the
          distribution you specified.
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          Exam Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md">
          <div>
            <p className="text-sm text-gray-500 font-medium">Start Date</p>
            <p className="font-medium">{formatDate(exam.start_date)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">End Date</p>
            <p className="font-medium">{formatDate(exam.end_date)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Duration</p>
            <p className="font-medium">{exam.duration} minutes</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Status</p>
            <p className="font-medium">{exam.status || 'N/A'}</p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          Question Distribution
        </h2>
        <div className="bg-gray-50 p-4 rounded-md">
          {exam.question_references && exam.question_references.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {exam.question_references.map((ref, index) => (
                <div key={index} className="bg-white p-3 rounded shadow-sm">
                  <p className="font-medium text-gray-800">{ref.chapter}</p>
                  <p className="text-gray-600 font-medium">
                    {ref.count} questions
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 font-medium">
              No question distribution specified
            </p>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Sample Questions
        </h2>
        {sampleQuestions.length > 0 ? (
          <div className="space-y-6">
            {sampleQuestions.map((question, qIndex) => (
              <div key={qIndex} className="bg-gray-50 p-4 rounded-md">
                <div className="flex items-start mb-3">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">
                    {qIndex + 1}
                  </span>
                  <div className="font-medium text-gray-800">
                    {question.question_text}
                  </div>
                </div>

                {question.question_type === 'multiple-choice' && (
                  <div className="ml-8 space-y-2">
                    {question.answers &&
                      question.answers.map((answer, aIndex) => (
                        <div key={aIndex} className="flex items-center">
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center mr-2 ${
                              answer.is_correct
                                ? 'bg-green-100 border-green-500'
                                : 'border-gray-300'
                            }`}
                          >
                            {answer.is_correct && (
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            )}
                          </div>
                          <span
                            className={
                              answer.is_correct
                                ? 'text-green-700 font-medium'
                                : 'text-gray-700'
                            }
                          >
                            {answer.answer_text}
                          </span>
                        </div>
                      ))}
                  </div>
                )}

                {question.question_type === 'true/false' && (
                  <div className="ml-8 space-y-2">
                    <div className="flex items-center">
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center mr-2 ${
                          question.correct_answer === true
                            ? 'bg-green-100 border-green-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {question.correct_answer === true && (
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        )}
                      </div>
                      <span
                        className={
                          question.correct_answer === true
                            ? 'text-green-700 font-medium'
                            : 'text-gray-700'
                        }
                      >
                        True
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center mr-2 ${
                          question.correct_answer === false
                            ? 'bg-green-100 border-green-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {question.correct_answer === false && (
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        )}
                      </div>
                      <span
                        className={
                          question.correct_answer === false
                            ? 'text-green-700 font-medium'
                            : 'text-gray-700'
                        }
                      >
                        False
                      </span>
                    </div>
                  </div>
                )}

                <div className="mt-2 ml-8 text-sm text-gray-500">
                  Chapter: {question.chapter || 'N/A'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-yellow-50 p-4 rounded-md">
            <div className="text-yellow-700 font-medium">
              No sample questions available for preview
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamPreview;
