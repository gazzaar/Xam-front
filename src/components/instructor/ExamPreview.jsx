import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import dotenv from "dotenv";
dotenv.config();

const ExamPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [sampleQuestions, setSampleQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchExamPreview();
  }, [id]);

  const fetchExamPreview = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.VITE_API_URL}/api/instructor/exams/${id}/preview`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("Exam preview data:", response.data);

      if (response.data) {
        setExam(response.data.exam);
        setSampleQuestions(response.data.sampleQuestions || []);
      } else {
        setError("Failed to load exam preview");
      }
    } catch (err) {
      console.error("Error fetching exam preview:", err);
      setError(err.message || "Failed to load exam preview");
      toast.error(err.message || "Failed to load exam preview");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const calculateStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
      return "upcoming";
    } else if (now >= start && now <= end) {
      return "active";
    } else {
      return "completed";
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "upcoming":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed":
        return "bg-slate-100 text-slate-800 border-slate-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const getDifficultyBadgeClass = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "hard":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "easy":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const calculateDifficulty = (metadata) => {
    try {
      if (!metadata || !metadata.difficultyDistribution) return "N/A";

      const dist = metadata.difficultyDistribution;
      const totalQuestions = dist.easy + dist.medium + dist.hard;

      if (!totalQuestions) return "N/A";

      const hardPercentage = (dist.hard / totalQuestions) * 100;
      const mediumPercentage = (dist.medium / totalQuestions) * 100;

      if (hardPercentage > 60) return "Hard";
      if (hardPercentage + mediumPercentage > 60) return "Medium";
      return "Easy";
    } catch (error) {
      console.error("Error calculating difficulty:", error);
      return "N/A";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-lg shadow-sm">
        <div className="text-red-800 font-semibold text-lg mb-2">
          Error loading exam preview
        </div>
        <div className="text-red-700 mb-4">{error}</div>
        <button
          onClick={() => navigate("/instructor/exams")}
          className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-600 transition-colors duration-200 font-medium"
        >
          Back to Exams
        </button>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="bg-yellow-50 p-6 rounded-lg shadow-sm">
        <div className="text-yellow-800 font-semibold text-lg mb-4">
          Exam not found
        </div>
        <button
          onClick={() => navigate("/instructor/exams")}
          className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-600 transition-colors duration-200 font-medium"
        >
          Back to Exams
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="border-b border-slate-200">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {exam.exam_name}
              </h1>
              <div className="mt-2 flex items-center gap-2">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadgeClass(
                    calculateStatus(exam.start_date, exam.end_date),
                  )}`}
                >
                  {calculateStatus(exam.start_date, exam.end_date)}
                </span>
                {exam.exam_metadata && (
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyBadgeClass(
                      calculateDifficulty(exam.exam_metadata),
                    )}`}
                  >
                    {calculateDifficulty(exam.exam_metadata)}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => navigate("/instructor/exams")}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors duration-200 font-medium"
            >
              Back to Exams
            </button>
          </div>
          <p className="mt-3 text-slate-600">{exam.description}</p>
        </div>
      </div>

      {exam.exam_metadata?.difficultyDistribution && (
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">
            Difficulty Distribution
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
              <p className="text-sm text-emerald-800 font-medium">
                Easy Questions
              </p>
              <p className="text-2xl font-bold text-emerald-700">
                {exam.exam_metadata.difficultyDistribution.easy || 0}
              </p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <p className="text-sm text-orange-800 font-medium">
                Medium Questions
              </p>
              <p className="text-2xl font-bold text-orange-700">
                {exam.exam_metadata.difficultyDistribution.medium || 0}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-sm text-red-800 font-medium">Hard Questions</p>
              <p className="text-2xl font-bold text-red-700">
                {exam.exam_metadata.difficultyDistribution.hard || 0}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 space-y-6">
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div className="text-slate-700 font-medium mb-2">
            This is a preview of how the exam will appear to students
          </div>
          <div className="text-slate-600 text-sm">
            Note: Each student will receive a unique set of questions based on
            the distribution you specified.
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-slate-800 mb-4">
            Exam Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <p className="text-sm text-slate-500 font-medium mb-1">
                Exam Date
              </p>
              <p className="font-medium text-slate-800">
                {formatDate(exam.start_date)}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <p className="text-sm text-slate-500 font-medium mb-1">
                Duration
              </p>
              <p className="font-medium text-slate-800">
                {exam.duration} minutes
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200 col-span-full">
              <p className="text-sm text-slate-500 font-medium mb-2">
                Exam Time
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Start Time</p>
                  <p className="font-medium text-slate-800">
                    {formatTime(exam.start_date)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">End Time</p>
                  <p className="font-medium text-slate-800">
                    {formatTime(exam.end_date)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-slate-800 mb-4">
            Questions Distribution
          </h2>
          <div className="bg-white rounded-lg border border-slate-200">
            {exam.question_references && exam.question_references.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
                {exam.question_references.map((ref, index) => (
                  <div
                    key={index}
                    className="bg-slate-50 p-4 rounded-lg border border-slate-200"
                  >
                    <p className="font-medium text-slate-800">{ref.chapter}</p>
                    <p className="text-slate-600">
                      {ref.count} {ref.count === 1 ? "question" : "questions"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-slate-600">
                No question distribution specified
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-slate-800 mb-4">
            Sample Questions
          </h2>
          {sampleQuestions.length > 0 ? (
            <div className="space-y-4">
              {sampleQuestions.map((question, qIndex) => (
                <div
                  key={qIndex}
                  className="bg-white p-6 rounded-lg border border-slate-200"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-slate-700 text-white rounded-full flex items-center justify-center font-medium">
                      {qIndex + 1}
                    </span>
                    <div className="flex-grow">
                      <div className="font-medium text-slate-800 mb-4">
                        {question.question_text}
                      </div>
                      {question.image_url && (
                        <div className="mb-4 max-w-md">
                          <img
                            src={(() => {
                              const url = question.image_url;
                              if (!url) return "";

                              // For external URLs, use the proxy service
                              if (url.startsWith("http")) {
                                return `https://images.weserv.nl/?url=${encodeURIComponent(
                                  url,
                                )}`;
                              }

                              // For local URLs, use as is
                              return url;
                            })()}
                            alt="Question"
                            className="rounded-lg object-contain w-full max-h-[400px]"
                            onError={(e) => {
                              console.error(
                                "Image failed to load:",
                                e.target.src,
                              );
                              e.target.onerror = null;

                              // Create a fallback div with error message
                              const parent = e.target.parentElement;
                              const fallbackDiv = document.createElement("div");
                              fallbackDiv.className =
                                "p-4 text-center text-slate-500 bg-slate-50 rounded-lg";
                              fallbackDiv.innerHTML = `
                                <svg class="w-12 h-12 mx-auto mb-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p>Image could not be loaded</p>
                                <p class="text-xs mt-1 text-slate-400">Please check if the image URL is valid</p>
                              `;

                              // Replace the img with the fallback
                              e.target.style.display = "none";
                              parent.appendChild(fallbackDiv);

                              toast.error("Failed to load question image", {
                                duration: 3000,
                                icon: "🖼️",
                              });
                            }}
                          />
                        </div>
                      )}

                      {question.question_type === "multiple-choice" && (
                        <div className="space-y-3 ml-4">
                          {question.answers &&
                            question.answers.map((answer, aIndex) => (
                              <div
                                key={aIndex}
                                className={`flex items-center p-3 rounded-md ${
                                  answer.is_correct
                                    ? "bg-green-50 border border-green-200"
                                    : "bg-slate-50 border border-slate-200"
                                }`}
                              >
                                <div
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${
                                    answer.is_correct
                                      ? "border-green-500 bg-green-500"
                                      : "border-slate-300"
                                  }`}
                                >
                                  {answer.is_correct && (
                                    <svg
                                      className="w-3 h-3 text-white"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                                    </svg>
                                  )}
                                </div>
                                <span
                                  className={
                                    answer.is_correct
                                      ? "text-green-800 font-medium"
                                      : "text-slate-700"
                                  }
                                >
                                  {answer.answer_text}
                                </span>
                              </div>
                            ))}
                        </div>
                      )}

                      {question.question_type === "true/false" && (
                        <div className="space-y-3 ml-4">
                          {["True", "False"].map((option) => {
                            const isCorrect =
                              (option === "True" && question.correct_answer) ||
                              (option === "False" && !question.correct_answer);
                            return (
                              <div
                                key={option}
                                className={`flex items-center p-3 rounded-md ${
                                  isCorrect
                                    ? "bg-green-50 border border-green-200"
                                    : "bg-slate-50 border border-slate-200"
                                }`}
                              >
                                <div
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${
                                    isCorrect
                                      ? "border-green-500 bg-green-500"
                                      : "border-slate-300"
                                  }`}
                                >
                                  {isCorrect && (
                                    <svg
                                      className="w-3 h-3 text-white"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                                    </svg>
                                  )}
                                </div>
                                <span
                                  className={
                                    isCorrect
                                      ? "text-green-800 font-medium"
                                      : "text-slate-700"
                                  }
                                >
                                  {option}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <div className="mt-3 ml-4 text-sm text-slate-500">
                        Chapter: {question.chapter || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="text-yellow-800 font-medium">
                No sample questions available for preview
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamPreview;
