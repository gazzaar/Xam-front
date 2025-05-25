import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { instructorService } from '../../services/api';

export default function InstructorDashboard() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
    // Set up periodic refresh every 30 seconds
    const refreshInterval = setInterval(fetchDashboardStats, 30000);

    // Cleanup interval on component unmount
    return () => clearInterval(refreshInterval);
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);
      const response = await instructorService.getDashboardStats();
      setStats(response.data);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch dashboard statistics');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Courses</h2>
          <p className="text-3xl font-bold text-slate-600">
            {stats?.courses_count || 0}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Question Banks</h2>
          <p className="text-3xl font-bold text-slate-600">
            {stats?.question_banks_count || 0}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Questions</h2>
          <p className="text-3xl font-bold text-slate-600">
            {stats?.questions_count || 0}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Exams</h2>
          <p className="text-3xl font-bold text-slate-600">
            {stats?.exams_count || 0}
          </p>
        </div>
      </div>
    </div>
  );
}
