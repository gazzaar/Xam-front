import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { useLocation, useNavigate } from 'react-router-dom';
import { studentStatsService } from '../../services/api';

export default function ExamComplete() {
  const location = useLocation();
  const navigate = useNavigate();
  const examId =
    location.state?.examLinkId || sessionStorage.getItem('lastExamLinkId');
  const studentId =
    location.state?.studentId ||
    JSON.parse(sessionStorage.getItem('examSession'))?.studentId ||
    null;

  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!examId) {
      navigate('/', { replace: true });
      return;
    }
    if (examId) sessionStorage.setItem('lastExamLinkId', examId);
    fetchStats();
    // eslint-disable-next-line
  }, [examId, studentId]);

  const fetchStats = async () => {
    setLoadingStats(true);
    setError(null);
    try {
      if (!examId || !studentId) {
        setError('Missing exam or student information');
        return;
      }
      const data = await studentStatsService.getExamStats(examId, studentId);
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingStats(false);
    }
  };

  const numericScore = stats?.student?.score || 0;
  const displayScore = isNaN(numericScore) ? 0 : numericScore;

  const handleNavigateHome = () => {
    sessionStorage.removeItem('examSession');
    sessionStorage.removeItem('lastExamLinkId');
    navigate('/', { replace: true });
  };

  // ApexCharts data for chapter performance
  let apexOptions = null;
  let apexSeries = null;
  if (
    stats?.available &&
    stats.student?.per_chapter &&
    stats.chapters?.length
  ) {
    const chapters = stats.chapters;
    const correct = chapters.map(
      (ch) => stats.student.per_chapter[ch]?.correct || 0
    );
    const incorrect = chapters.map(
      (ch) => stats.student.per_chapter[ch]?.incorrect || 0
    );
    const totals = chapters.map((_, i) => correct[i] + incorrect[i]);
    const correctPct = correct.map((v, i) =>
      totals[i] ? (v / totals[i]) * 100 : 0
    );
    const incorrectPct = incorrect.map((v, i) =>
      totals[i] ? (v / totals[i]) * 100 : 0
    );
    apexSeries = [
      {
        name: 'Correct',
        data: correctPct,
      },
      {
        name: 'Incorrect',
        data: incorrectPct,
      },
    ];
    apexOptions = {
      chart: {
        type: 'bar',
        stacked: true,
        stackType: '100%',
        height: 300,
        toolbar: { show: false },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          borderRadius: 4,
          dataLabels: {
            total: {
              enabled: true,
              formatter: function (val) {
                return val.toFixed(1) + '%';
              },
            },
          },
        },
      },
      dataLabels: {
        enabled: true,
        formatter: function (val) {
          return val.toFixed(1) + '%';
        },
      },
      xaxis: {
        categories: chapters,
        title: { text: 'Chapter' },
      },
      yaxis: {
        min: 0,
        max: 100,
        labels: {
          formatter: function (val) {
            return val + '%';
          },
        },
        title: { text: 'Percent of Answers' },
      },
      legend: {
        position: 'top',
        horizontalAlign: 'center',
      },
      fill: {
        opacity: 1,
        colors: ['#00A550', '#DC343B'],
      },
      colors: ['#00A550', '#DC343B'],
      tooltip: {
        y: {
          formatter: function (val) {
            return val.toFixed(1) + '%';
          },
        },
      },
      title: {
        text: 'Chapter Performance',
        align: 'center',
        style: { fontSize: '18px' },
      },
    };
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-6">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mr-4">
              <svg
                className="w-8 h-8 text-green-600"
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
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                Exam Completed!
              </h1>
              <p className="text-slate-600 mt-1">
                Thank you for completing the exam. Here are your results:
              </p>
            </div>
          </div>

          {/* Score Display */}
          <div className="flex justify-center mb-6">
            <div className="bg-slate-50 rounded-lg px-8 py-4">
              <div className="text-5xl font-bold text-slate-800 text-center">
                {displayScore.toFixed(1)}%
              </div>
              <p className="text-slate-600 text-center mt-1">Final Score</p>
            </div>
          </div>

          {/* Stats Section */}
          {loadingStats ? (
            <div className="text-center text-slate-600">Loading stats...</div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : stats && !stats.available ? (
            <div className="text-center text-slate-600">
              Stats will be available after the exam ends for all students.
            </div>
          ) : stats && stats.available ? (
            <div className="space-y-6">
              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Your Performance */}
                <div className="bg-slate-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">
                    Your Performance
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Duration:</span>
                      <span className="font-medium text-slate-800">
                        {stats.student.duration
                          ? `${Math.floor(
                              stats.student.duration / 60
                            )}m ${Math.round(stats.student.duration % 60)}s`
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Score:</span>
                      <span className="font-medium text-slate-800">
                        {displayScore.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Class Performance */}
                <div className="bg-slate-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">
                    Class Performance
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Average Score:</span>
                      <span className="font-medium text-slate-800">
                        {stats.class.avg_score.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Average Duration:</span>
                      <span className="font-medium text-slate-800">
                        {stats.class.avg_duration
                          ? `${Math.floor(
                              stats.class.avg_duration / 60
                            )}m ${Math.round(stats.class.avg_duration % 60)}s`
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Score Comparison */}
                <div className="bg-slate-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">
                    Score Comparison
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Your Score:</span>
                      <span className="font-medium text-slate-800">
                        {displayScore.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Class Average:</span>
                      <span className="font-medium text-slate-800">
                        {stats.class.avg_score.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Difference:</span>
                      <span
                        className={`font-medium ${
                          displayScore > stats.class.avg_score
                            ? 'text-[#00A550]'
                            : 'text-[#DC343B]'
                        }`}
                      >
                        {(displayScore - stats.class.avg_score).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chapter Performance Chart */}
              {apexOptions && apexSeries && (
                <div className="bg-white rounded-lg p-6 mt-6">
                  <ReactApexChart
                    options={apexOptions}
                    series={apexSeries}
                    type="bar"
                    height={300}
                  />
                </div>
              )}
            </div>
          ) : null}

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-slate-600 mb-4">
              Your responses have been recorded. You may now close this window.
            </p>
            <button
              onClick={handleNavigateHome}
              className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
