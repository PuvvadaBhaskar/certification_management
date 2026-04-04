import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { Calendar, AlertCircle, Clock, CheckCircle, Loader } from "lucide-react";
import { getDashboard } from "../api/dashboard";

const COLORS = ["#22c55e", "#ef4444", "#eab308"];

function UserDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const getUserId = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      if (user?.id !== undefined && user?.id !== null) {
        return String(user.id);
      }
    } catch {
      // Ignore malformed user JSON.
    }

    const fallbackId = localStorage.getItem("userId");
    if (fallbackId && fallbackId !== "null" && fallbackId !== "undefined") {
      return fallbackId;
    }

    return null;
  };

  const userId = getUserId();

  const fetchDashboard = async () => {
    try {
      if (!userId) {
        navigate("/");
        return;
      }

      setLoading(true);
      setError(null);
      const dashboardInfo = await getDashboard(userId);
      setDashboardData(dashboardInfo);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch dashboard data");
      console.error("Error fetching dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, navigate]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <Loader className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
          <div className="p-6 bg-red-500/10 border border-red-500 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <div>
              <p className="text-red-500 font-medium">{error}</p>
              <button
                onClick={fetchDashboard}
                className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!dashboardData) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-400">No dashboard data available</p>
        </div>
      </DashboardLayout>
    );
  }

  const total = dashboardData.total || 0;
  const active = dashboardData.active || 0;
  const expired = dashboardData.expired || 0;
  const expiringSoon = dashboardData.expiringSoon || 0;

  const activePercentage = total > 0 ? Math.round((active / total) * 100) : 0;
  const expiredPercentage = total > 0 ? Math.round((expired / total) * 100) : 0;
  const expiringSoonPercentage =
    total > 0 ? Math.round((expiringSoon / total) * 100) : 0;

  // Status Data for Pie Chart
  const statusData = [
    { name: "Active", value: active },
    { name: "Expired", value: expired },
    { name: "Expiring Soon", value: expiringSoon },
  ].filter((item) => item.value > 0);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-10">Dashboard Analytics</h1>

        {/* Stats Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {/* Total */}
          <div className="group relative p-6 rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 hover:border-blue-500 transition">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-300">Total</h2>
                <p className="text-3xl font-bold mt-2 text-blue-400">
                  {total}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-400 opacity-30" />
            </div>
          </div>

          {/* Active */}
          <div className="group relative p-6 rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 hover:border-green-500 transition">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-300">
                  Active ({activePercentage}%)
                </h2>
                <p className="text-3xl font-bold mt-2 text-green-400">
                  {active}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400 opacity-30" />
            </div>
          </div>

          {/* Expiring Soon */}
          <div className="group relative p-6 rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 hover:border-yellow-500 transition">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-300">
                  Expiring Soon ({expiringSoonPercentage}%)
                </h2>
                <p className="text-3xl font-bold mt-2 text-yellow-400">
                  {expiringSoon}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400 opacity-30" />
            </div>
          </div>

          {/* Expired */}
          <div className="group relative p-6 rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 hover:border-red-500 transition">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-300">
                  Expired ({expiredPercentage}%)
                </h2>
                <p className="text-3xl font-bold mt-2 text-red-400">
                  {expired}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-400 opacity-30" />
            </div>
          </div>
        </div>

        {/* Charts */}
        {statusData.length > 0 && (
          <div className="bg-white/5 backdrop-blur-lg p-8 rounded-xl border border-white/10 mb-12">
            <h2 className="text-2xl font-semibold mb-6">Status Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  outerRadius={100}
                  label
                  cx="50%"
                  cy="50%"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Summary Info */}
        <div className="bg-white/5 backdrop-blur-lg p-8 rounded-xl border border-white/10">
          <h2 className="text-2xl font-semibold mb-6">Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-green-500/10 border border-green-500 rounded-lg">
              <p className="text-sm text-gray-300 mb-2">Active Certifications</p>
              <p className="text-2xl font-bold text-green-400">
                {active} out of {total}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Keep these up to date
              </p>
            </div>
            <div className="p-4 bg-yellow-500/10 border border-yellow-500 rounded-lg">
              <p className="text-sm text-gray-300 mb-2">Expiring Soon</p>
              <p className="text-2xl font-bold text-yellow-400">
                {expiringSoon}
              </p>
              <p className="text-xs text-gray-400 mt-2">Within next 30 days</p>
            </div>
            <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg">
              <p className="text-sm text-gray-300 mb-2">Expired</p>
              <p className="text-2xl font-bold text-red-400">{expired}</p>
              <p className="text-xs text-gray-400 mt-2">
                Action needed
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default UserDashboard;