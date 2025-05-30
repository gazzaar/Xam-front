import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { toast } from 'react-hot-toast';
import { instructorService } from '../../services/api';

export default function InstructorDashboard() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [overallGradeDistribution, setOverallGradeDistribution] =
    useState(null);
  const [overallChapterPerformance, setOverallChapterPerformance] =
    useState(null);
  const [selectedExam, setSelectedExam] = useState('overall');

  useEffect(() => {
    fetchDashboardStats();
    // Set up periodic refresh every 6 hours (6 * 60 * 60 * 1000 milliseconds)
    const refreshInterval = setInterval(fetchDashboardStats, 21600000);

    // Cleanup interval on component unmount
    return () => clearInterval(refreshInterval);
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);
      const data = await instructorService.getDashboardStats();
      console.log('Dashboard API Response:', data);

      setStats(data);

      // Set overall grade distribution data
      if (data?.grade_distribution?.ranges?.length > 0) {
        console.log(
          'Setting up overall grade distribution chart with:',
          data.grade_distribution
        );
        setOverallGradeDistribution({
          options: {
            chart: {
              type: 'bar',
              height: 350,
            },
            plotOptions: {
              bar: {
                borderRadius: 4,
                dataLabels: {
                  position: 'top',
                },
              },
            },
            dataLabels: {
              enabled: true,
              formatter: function (val) {
                return val + ' students';
              },
              offsetY: -20,
              style: {
                fontSize: '12px',
                colors: ['#304758'],
              },
            },
            xaxis: {
              categories: data.grade_distribution.ranges,
              position: 'bottom',
              title: {
                text: 'Grade Ranges',
              },
            },
            yaxis: {
              title: {
                text: 'Number of Students',
              },
            },
            title: {
              text: 'Overall Grade Distribution',
              align: 'center',
              style: {
                fontSize: '18px',
              },
            },
          },
          series: [
            {
              name: 'Students',
              data: data.grade_distribution.counts,
            },
          ],
        });
      } else {
        console.log('No overall grade distribution data available');
        setOverallGradeDistribution(null);
      }

      // Set overall chapter performance data
      if (data?.chapter_performance?.chapters?.length > 0) {
        console.log(
          'Setting up overall chapter performance chart with:',
          data.chapter_performance
        );
        setOverallChapterPerformance({
          options: {
            chart: {
              type: 'bar',
              height: 350,
              stacked: true,
              stackType: '100%',
            },
            plotOptions: {
              bar: {
                horizontal: false,
              },
            },
            stroke: {
              width: 1,
              colors: ['#fff'],
            },
            title: {
              text: 'Overall Chapter Performance Analysis',
              align: 'center',
              style: {
                fontSize: '18px',
              },
            },
            xaxis: {
              categories: data.chapter_performance.chapters,
              title: {
                text: 'Chapters',
              },
            },
            yaxis: {
              title: {
                text: 'Percentage',
              },
            },
            tooltip: {
              y: {
                formatter: function (val) {
                  return val + '%';
                },
              },
            },
            fill: {
              opacity: 1,
            },
            legend: {
              position: 'top',
              horizontalAlign: 'center',
            },
            colors: ['#4ade80', '#f87171'],
          },
          series: [
            {
              name: 'Correct',
              data: data.chapter_performance.correct_percentages,
            },
            {
              name: 'Incorrect',
              data: data.chapter_performance.incorrect_percentages,
            },
          ],
        });
      } else {
        console.log('No overall chapter performance data available');
        setOverallChapterPerformance(null);
      }
    } catch (err) {
      console.error('Dashboard error:', err);
      toast.error('Failed to fetch dashboard statistics');
      setStats({
        active_exams_count: 0,
        exams_count: 0,
        students_today: 0,
        average_score: 0,
      });
      setOverallGradeDistribution(null);
      setOverallChapterPerformance(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getExamCharts = (exam) => {
    const gradeDistribution =
      exam.grade_distribution?.ranges?.length > 0
        ? {
            options: {
              chart: {
                type: 'bar',
                height: 350,
              },
              plotOptions: {
                bar: {
                  borderRadius: 4,
                  dataLabels: {
                    position: 'top',
                  },
                },
              },
              dataLabels: {
                enabled: true,
                formatter: function (val) {
                  return val + ' students';
                },
                offsetY: -20,
                style: {
                  fontSize: '12px',
                  colors: ['#304758'],
                },
              },
              xaxis: {
                categories: exam.grade_distribution.ranges,
                position: 'bottom',
                title: {
                  text: 'Grade Ranges',
                },
              },
              yaxis: {
                title: {
                  text: 'Number of Students',
                },
              },
              title: {
                text: `${exam.exam_name} - Grade Distribution`,
                align: 'center',
                style: {
                  fontSize: '18px',
                },
              },
            },
            series: [
              {
                name: 'Students',
                data: exam.grade_distribution.counts,
              },
            ],
          }
        : null;

    const chapterPerformance =
      exam.chapter_performance?.chapters?.length > 0
        ? {
            options: {
              chart: {
                type: 'bar',
                height: 350,
                stacked: true,
                stackType: '100%',
              },
              plotOptions: {
                bar: {
                  horizontal: false,
                },
              },
              stroke: {
                width: 1,
                colors: ['#fff'],
              },
              title: {
                text: `${exam.exam_name} - Chapter Performance Analysis`,
                align: 'center',
                style: {
                  fontSize: '18px',
                },
              },
              xaxis: {
                categories: exam.chapter_performance.chapters,
                title: {
                  text: 'Chapters',
                },
              },
              yaxis: {
                title: {
                  text: 'Percentage',
                },
              },
              tooltip: {
                y: {
                  formatter: function (val) {
                    return val + '%';
                  },
                },
              },
              fill: {
                opacity: 1,
              },
              legend: {
                position: 'top',
                horizontalAlign: 'center',
              },
              colors: ['#4ade80', '#f87171'],
            },
            series: [
              {
                name: 'Correct',
                data: exam.chapter_performance.correct_percentages,
              },
              {
                name: 'Incorrect',
                data: exam.chapter_performance.incorrect_percentages,
              },
            ],
          }
        : null;

    return { gradeDistribution, chapterPerformance };
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-700"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Exam Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Active Exams Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-800">
              My Active Exams
            </h2>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </span>
          </div>
          <p className="mt-4 text-3xl font-bold text-slate-800">
            {stats?.active_exams_count || 0}
          </p>
          <p className="mt-1 text-sm text-slate-600">Currently in progress</p>
        </div>

        {/* Today's Students Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-800">
              Today&apos;s Students
            </h2>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </span>
          </div>
          <p className="mt-4 text-3xl font-bold text-slate-800">
            {stats?.students_today || 0}
          </p>
          <p className="mt-1 text-sm text-slate-600">Taking my exams today</p>
        </div>

        {/* Average Score Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-800">
              Average Score
            </h2>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
              <svg
                className="h-6 w-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </span>
          </div>
          <p className="mt-4 text-3xl font-bold text-slate-800">
            {stats?.average_score?.toFixed(1) || '0.0'}%
          </p>
          <p className="mt-1 text-sm text-slate-600">Across my exams</p>
        </div>

        {/* Total Exams Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-800">
              My Total Exams
            </h2>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
              <svg
                className="h-6 w-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </span>
          </div>
          <p className="mt-4 text-3xl font-bold text-slate-800">
            {stats?.exams_count || 0}
          </p>
          <p className="mt-1 text-sm text-slate-600">Total created</p>
        </div>
      </div>

      {/* Exam Selector */}
      <div className="mb-8">
        <select
          className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          value={selectedExam}
          onChange={(e) => setSelectedExam(e.target.value)}
        >
          <option value="overall">My Overall Statistics</option>
          {stats?.exam_stats?.map((exam) => (
            <option key={exam.exam_id} value={exam.exam_id}>
              {exam.exam_name}
            </option>
          ))}
        </select>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {selectedExam === 'overall' ? (
          <>
            {/* Overall Grade Distribution Chart */}
            {overallGradeDistribution && (
              <div className="bg-white rounded-lg shadow p-6">
                <ReactApexChart
                  options={overallGradeDistribution.options}
                  series={overallGradeDistribution.series}
                  type="bar"
                  height={350}
                />
              </div>
            )}

            {/* Overall Chapter Performance Chart */}
            {overallChapterPerformance && (
              <div className="bg-white rounded-lg shadow p-6">
                <ReactApexChart
                  options={overallChapterPerformance.options}
                  series={overallChapterPerformance.series}
                  type="bar"
                  height={350}
                />
              </div>
            )}
          </>
        ) : (
          <>
            {/* Individual Exam Charts */}
            {stats?.exam_stats?.map((exam) => {
              if (exam.exam_id.toString() === selectedExam) {
                const { gradeDistribution, chapterPerformance } =
                  getExamCharts(exam);
                return (
                  <React.Fragment key={exam.exam_id}>
                    {gradeDistribution && (
                      <div className="bg-white rounded-lg shadow p-6">
                        <ReactApexChart
                          options={gradeDistribution.options}
                          series={gradeDistribution.series}
                          type="bar"
                          height={350}
                        />
                      </div>
                    )}
                    {chapterPerformance && (
                      <div className="bg-white rounded-lg shadow p-6">
                        <ReactApexChart
                          options={chapterPerformance.options}
                          series={chapterPerformance.series}
                          type="bar"
                          height={350}
                        />
                      </div>
                    )}
                  </React.Fragment>
                );
              }
              return null;
            })}
          </>
        )}
      </div>
    </div>
  );
}
