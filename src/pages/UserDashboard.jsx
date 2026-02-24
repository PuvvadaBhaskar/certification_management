import { useEffect, useState } from "react";
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
import { Calendar, TrendingUp, Clock, CheckCircle } from "lucide-react";

const COLORS = ["#22c55e", "#ef4444", "#eab308"];

function UserDashboard() {
  const [certifications, setCertifications] = useState([]);

  useEffect(() => {
    const username = localStorage.getItem("username");
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const currentUser = users.find(
      (u) => u.username === username
    );

    setCertifications(currentUser?.certifications || []);
  }, []);

  // Calculate statistics
  const total = certifications.length;
  const active = certifications.filter(
    (c) => new Date(c.expiryDate) > new Date()
  ).length;
  const expired = certifications.filter(
    (c) => new Date(c.expiryDate) <= new Date()
  ).length;
  const expiringSoon = certifications.filter((c) => {
    const daysUntilExpiry = Math.ceil(
      (new Date(c.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  }).length;

  // Calculate percentage stats
  const activePercentage = total > 0 ? Math.round((active / total) * 100) : 0;
  const expiredPercentage = total > 0 ? Math.round((expired / total) * 100) : 0;

  // Get upcoming expirations (next 90 days)
  const upcomingExpirations = certifications
    .filter((c) => {
      const daysUntilExpiry = Math.ceil(
        (new Date(c.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
      );
      return daysUntilExpiry <= 90 && daysUntilExpiry >= 0;
    })
    .sort(
      (a, b) =>
        new Date(a.expiryDate) - new Date(b.expiryDate)
    )
    .slice(0, 5);

  // Prepare chart data
  const statusData = [
    { name: "Active", value: active },
    { name: "Expired", value: expired },
    { name: "Expiring Soon", value: expiringSoon },
  ];

  // Get certifications by month (for timeline)
  const monthlyData = {};
  certifications.forEach((cert) => {
    const date = new Date(cert.expiryDate);
    const month = date.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
    monthlyData[month] = (monthlyData[month] || 0) + 1;
  });

  const timelineData = Object.entries(monthlyData)
    .map(([month, count]) => ({ month, expirations: count }))
    .slice(0, 6);

  return (
    <DashboardLayout>
      <h1 className="text-4xl font-bold mb-10">
        Dashboard Analysis 📊
      </h1>

      {/* 🔥 STATS BOXES WITH GLOW - ENHANCED */}
      <div className="grid grid-cols-4 gap-6 mb-12">
        {/* Total */}
        <div className="group relative p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 transition-all duration-300 hover:scale-105 hover:border-blue-500 hover:shadow-[0_0_40px_rgba(59,130,246,0.8)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-300 group-hover:text-white">
                Total
              </h2>
              <p className="text-3xl font-bold mt-2 text-blue-400 group-hover:text-blue-300">
                {total}
              </p>
            </div>
            <Calendar className="text-blue-400 opacity-30 group-hover:opacity-50" />
          </div>
        </div>

        {/* Active */}
        <div className="group relative p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 transition-all duration-300 hover:scale-105 hover:border-green-500 hover:shadow-[0_0_40px_rgba(34,197,94,0.8)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-300 group-hover:text-white">
                Active ({activePercentage}%)
              </h2>
              <p className="text-3xl font-bold mt-2 text-green-400 group-hover:text-green-300">
                {active}
              </p>
            </div>
            <CheckCircle className="text-green-400 opacity-30 group-hover:opacity-50" />
          </div>
        </div>

        {/* Expiring Soon */}
        <div className="group relative p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 transition-all duration-300 hover:scale-105 hover:border-yellow-500 hover:shadow-[0_0_40px_rgba(234,179,8,0.8)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-300 group-hover:text-white">
                Expiring Soon
              </h2>
              <p className="text-3xl font-bold mt-2 text-yellow-400 group-hover:text-yellow-300">
                {expiringSoon}
              </p>
            </div>
            <Clock className="text-yellow-400 opacity-30 group-hover:opacity-50" />
          </div>
        </div>

        {/* Expired */}
        <div className="group relative p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 transition-all duration-300 hover:scale-105 hover:border-red-500 hover:shadow-[0_0_40px_rgba(239,68,68,0.8)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-300 group-hover:text-white">
                Expired ({expiredPercentage}%)
              </h2>
              <p className="text-3xl font-bold mt-2 text-red-400 group-hover:text-red-300">
                {expired}
              </p>
            </div>
            <TrendingUp className="text-red-400 opacity-30 group-hover:opacity-50" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-2 gap-6 mb-12">
        {/* Pie Chart */}
        <div className="bg-white/10 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/10">
          <h2 className="text-2xl font-semibold mb-6">
            Status Distribution
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                outerRadius={120}
                label
              >
                {statusData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Timeline Bar Chart */}
        {timelineData.length > 0 && (
          <div className="bg-white/10 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/10">
            <h2 className="text-2xl font-semibold mb-6">
              Expiration Timeline
            </h2>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="expirations" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Upcoming Expirations */}
      {upcomingExpirations.length > 0 && (
        <div className="bg-white/10 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/10">
          <h2 className="text-2xl font-semibold mb-6">
            ⏰ Upcoming Expirations (Next 90 Days)
          </h2>
          <div className="space-y-3">
            {upcomingExpirations.map((cert) => {
              const daysUntil = Math.ceil(
                (new Date(cert.expiryDate) - new Date()) /
                  (1000 * 60 * 60 * 24)
              );
              const urgency =
                daysUntil <= 30
                  ? "bg-red-500/20 border-red-500"
                  : daysUntil <= 60
                    ? "bg-yellow-500/20 border-yellow-500"
                    : "bg-blue-500/20 border-blue-500";

              return (
                <div
                  key={cert.id}
                  className={`border-l-4 p-4 rounded-lg ${urgency}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">
                        {cert.name}
                      </p>
                      <p className="text-sm text-gray-400">
                        {cert.organization}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        {daysUntil} days
                      </p>
                      <p className="text-sm text-gray-400">
                        {cert.expiryDate}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}

export default UserDashboard;