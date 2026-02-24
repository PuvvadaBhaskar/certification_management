import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  TrendingUp,
  Calendar,
  Download,
  Filter,
  AlertCircle,
} from "lucide-react";
import { generatePDF, exportToJSON } from "../utils/pdfExport";
import { logActivity } from "../utils/auditLog";

function AdminAnalytics() {
  const [dateRange, setDateRange] = useState("all");
  const [certificationTrend, setCertificationTrend] = useState([]);
  const [statusDistribution, setStatusDistribution] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [userEngagement, setUserEngagement] = useState([]);
  const [complianceMetrics, setComplianceMetrics] = useState({});

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  useEffect(() => {
    generateAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  const generateAnalytics = () => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const auditLogs = JSON.parse(localStorage.getItem("auditLogs") || "[]");

    // Certification trend data (7 days)
    const trendData = generateCertTrend();
    setCertificationTrend(trendData);

    // Status distribution
    const distribution = generateStatusDistribution(users);
    setStatusDistribution(distribution);

    // Category breakdown
    const categories = generateCategoryBreakdown(users);
    setCategoryBreakdown(categories);

    // User engagement
    const engagement = generateUserEngagement(users, auditLogs);
    setUserEngagement(engagement);

    // Compliance metrics
    const compliance = generateComplianceMetrics(users);
    setComplianceMetrics(compliance);
  };

  const generateCertTrend = () => {
    const days = [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun",
    ];
    const data = days.map((day) => ({
      name: day,
      added: Math.floor(Math.random() * 15) + 2,
      expired: Math.floor(Math.random() * 8) + 1,
      renewed: Math.floor(Math.random() * 10) + 1,
    }));
    return data;
  };

  const generateStatusDistribution = (users) => {
    let activeCerts = 0,
      expiredCerts = 0,
      expiringSoon = 0;

    users.forEach((user) => {
      const certs = JSON.parse(
        localStorage.getItem(`certifications_${user.username}`) ||
          "[]"
      );
      const now = new Date();

      certs.forEach((cert) => {
        const expiryDate = new Date(cert.expiryDate);
        const daysUntilExpiry = Math.floor(
          (expiryDate - now) / (1000 * 60 * 60 * 24)
        );

        if (daysUntilExpiry < 0) {
          expiredCerts++;
        } else if (daysUntilExpiry <= 30) {
          expiringSoon++;
        } else {
          activeCerts++;
        }
      });
    });

    return [
      { name: "Active", value: activeCerts, fill: "#10b981" },
      {
        name: "Expiring Soon",
        value: expiringSoon,
        fill: "#f59e0b",
      },
      { name: "Expired", value: expiredCerts, fill: "#ef4444" },
    ];
  };

  const generateCategoryBreakdown = (users) => {
    const categories = {};

    users.forEach((user) => {
      const certs = JSON.parse(
        localStorage.getItem(`certifications_${user.username}`) ||
          "[]"
      );
      certs.forEach((cert) => {
        const category = cert.category || "Uncategorized";
        categories[category] = (categories[category] || 0) + 1;
      });
    });

    return Object.entries(categories).map(([name, value]) => ({
      name,
      value,
    }));
  };

  const generateUserEngagement = (users, logs) => {
    const topUsers = users.map((user) => {
      const userLogs = logs.filter(
        (log) => log.username === user.username
      );
      const userCerts = JSON.parse(
        localStorage.getItem(
          `certifications_${user.username}`
        ) || "[]"
      );
      return {
        name: user.username,
        activities: userLogs.length,
        certifications: userCerts.length,
      };
    });

    return topUsers.sort((a, b) => b.activities - a.activities).slice(0, 8);
  };

  const generateComplianceMetrics = (users) => {
    let totalCerts = 0,
      activeCerts = 0,
      complianceCerts = 0;

    const now = new Date();

    users.forEach((user) => {
      const certs = JSON.parse(
        localStorage.getItem(`certifications_${user.username}`) ||
          "[]"
      );
      certs.forEach((cert) => {
        totalCerts++;
        const expiryDate = new Date(cert.expiryDate);
        const daysUntilExpiry = Math.floor(
          (expiryDate - now) / (1000 * 60 * 60 * 24)
        );

        if (daysUntilExpiry > 30) {
          activeCerts++;
          complianceCerts++;
        } else if (daysUntilExpiry >= 0) {
          activeCerts++;
        }
      });
    });

    const complianceRate =
      totalCerts > 0
        ? ((complianceCerts / totalCerts) * 100).toFixed(1)
        : 0;

    return {
      totalCerts,
      activeCerts,
      complianceRate,
      nonCompliance: totalCerts - complianceCerts,
      compliancePercentage:
        totalCerts > 0
          ? ((activeCerts / totalCerts) * 100).toFixed(1)
          : 0,
    };
  };

  const downloadReport = (format) => {
    const report = {
      generatedAt: new Date().toISOString(),
      dateRange,
      certificationTrend,
      statusDistribution,
      categoryBreakdown,
      userEngagement,
      complianceMetrics,
    };

    const adminUsername = localStorage.getItem("username");

    if (format === "pdf") {
      generatePDF(
        JSON.stringify(report, null, 2),
        `analytics_report_${new Date().getTime()}.csv`
      );
    } else {
      exportToJSON(report, `analytics_report_${new Date().getTime()}`);
    }

    logActivity(
      adminUsername,
      "download_analytics_report",
      `Downloaded analytics report in ${format.toUpperCase()} format`
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <TrendingUp size={40} />
          Analytics & Reports
        </h1>
        <p className="text-gray-400 mb-8">
          Advanced analytics and performance metrics
        </p>

        {/* Compliance Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/10">
            <p className="text-gray-400 text-sm">Total Certifications</p>
            <p className="text-3xl font-bold text-blue-400">
              {complianceMetrics.totalCerts}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/10">
            <p className="text-gray-400 text-sm">Active Certifications</p>
            <p className="text-3xl font-bold text-green-400">
              {complianceMetrics.activeCerts}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/10">
            <p className="text-gray-400 text-sm">Compliance Rate</p>
            <p className="text-3xl font-bold text-purple-400">
              {complianceMetrics.complianceRate}%
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/10">
            <p className="text-gray-400 text-sm">Non-Compliant</p>
            <p className="text-3xl font-bold text-red-400">
              {complianceMetrics.nonCompliance}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/10 mb-8 flex gap-4 flex-wrap items-center">
          <div className="flex items-center gap-2">
            <Calendar size={20} />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </select>
          </div>

          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => downloadReport("json")}
              className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg flex items-center gap-2 transition"
            >
              <Download size={18} />
              JSON
            </button>
            <button
              onClick={() => downloadReport("csv")}
              className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg flex items-center gap-2 transition"
            >
              <Download size={18} />
              CSV
            </button>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Certification Trend */}
          <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/10">
            <h3 className="text-lg font-bold mb-4">
              Certification Trend (7 Days)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={certificationTrend}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="white/10"
                />
                <XAxis stroke="white/50" />
                <YAxis stroke="white/50" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="added"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Added"
                />
                <Line
                  type="monotone"
                  dataKey="renewed"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Renewed"
                />
                <Line
                  type="monotone"
                  dataKey="expired"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Expired"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Status Distribution */}
          <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/10">
            <h3 className="text-lg font-bold mb-4">
              Status Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) =>
                    `${name}: ${value}`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.fill}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/10">
            <h3 className="text-lg font-bold mb-4">
              Certifications by Category
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryBreakdown}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="white/10"
                />
                <XAxis
                  dataKey="name"
                  stroke="white/50"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="white/50" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* User Engagement */}
          <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/10">
            <h3 className="text-lg font-bold mb-4">
              Top Users by Activity
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userEngagement}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="white/10"
                />
                <XAxis
                  dataKey="name"
                  stroke="white/50"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="white/50" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="activities"
                  fill="#3b82f6"
                  name="Activities"
                />
                <Bar
                  dataKey="certifications"
                  fill="#10b981"
                  name="Certs"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Compliance Summary */}
        <div className="bg-gradient-to-r from-blue-500/20 to-purple-600/20 backdrop-blur-xl p-8 rounded-3xl border border-white/10">
          <div className="flex items-start gap-4">
            <AlertCircle size={32} className="text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-bold mb-3">
                Compliance Summary
              </h3>
              <p className="text-gray-300 mb-4">
                Overall system compliance is at{" "}
                <span className="font-bold text-green-400">
                  {complianceMetrics.compliancePercentage}%
                </span>
                . This includes all certifications that are currently
                active and valid. {complianceMetrics.nonCompliance}{" "}
                certificate(s) require immediate attention.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">
                    Compliance Target
                  </p>
                  <p className="text-2xl font-bold text-green-400">
                    95%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">
                    Current Status
                  </p>
                  <p className="text-2xl font-bold text-blue-400">
                    {complianceMetrics.compliancePercentage}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AdminAnalytics;
