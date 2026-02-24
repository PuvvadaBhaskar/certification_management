import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import {
  Users,
  FileText,
  AlertCircle,
  TrendingUp,
  Clock,
  CheckCircle,
  BarChart3,
  PieChart as PieChartIcon,
  Download,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import { exportToJSON } from "../utils/pdfExport";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCerts: 0,
    activeCerts: 0,
    expiredCerts: 0,
    expiringSoon: 0,
  });
  const [certsByStatus, setCertsByStatus] = useState([]);
  const [certsByCategory, setCertsByCategory] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const today = new Date();

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = () => {
    const stored =
      JSON.parse(localStorage.getItem("users")) || [];
    setUsers(stored);
    calculateStats(stored);
  };

  const calculateStats = (users) => {
    let totalCerts = 0;
    let activeCerts = 0;
    let expiredCerts = 0;
    let expiringSoon = 0;
    const categories = {};
    const userCertCounts = [];

    users.forEach((user) => {
      userCertCounts.push({
        username: user.username,
        count: user.certifications?.length || 0,
        role: user.role,
      });

      user.certifications?.forEach((cert) => {
        totalCerts++;
        const expiryDate = new Date(cert.expiryDate);
        const daysUntilExpiry = Math.ceil(
          (expiryDate - today) / (1000 * 60 * 60 * 24)
        );

        if (expiryDate <= today) {
          expiredCerts++;
        } else if (daysUntilExpiry <= 30) {
          expiringSoon++;
        } else {
          activeCerts++;
        }

        categories[cert.category || "Uncategorized"] =
          (categories[cert.category || "Uncategorized"] ||
            0) +
          1;
      });
    });

    setStats({
      totalUsers: users.length,
      totalCerts,
      activeCerts,
      expiredCerts,
      expiringSoon,
    });

    setCertsByStatus([
      { name: "Active", value: activeCerts },
      { name: "Expiring Soon", value: expiringSoon },
      { name: "Expired", value: expiredCerts },
    ]);

    setCertsByCategory(
      Object.entries(categories).map(([name, value]) => ({
        name,
        count: value,
      }))
    );

    setTopUsers(
      userCertCounts
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
    );

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
    ];
    const growth = months.map((month, idx) => ({
      month,
      users: Math.floor(users.length * (idx / 6)) + 1,
    }));
    setUserGrowth(growth);
  };

  const approveRenewal = (username, certId) => {
    const updated = users.map((u) => {
      if (u.username === username) {
        return {
          ...u,
          certifications: u.certifications.map((c) =>
            c.id === certId
              ? {
                  ...c,
                  expiryDate: c.newExpiryDate,
                  file: c.newFile || c.file,
                  renewalRequest: false,
                  verification: "approved",
                }
              : c
          ),
        };
      }
      return u;
    });

    localStorage.setItem(
      "users",
      JSON.stringify(updated)
    );
    loadData();
  };

  const rejectRenewal = (username, certId) => {
    const updated = users.map((u) => {
      if (u.username === username) {
        return {
          ...u,
          certifications: u.certifications.map((c) =>
            c.id === certId
              ? {
                  ...c,
                  renewalRequest: false,
                  verification: "rejected",
                }
              : c
          ),
        };
      }
      return u;
    });

    localStorage.setItem(
      "users",
      JSON.stringify(updated)
    );
    loadData();
  };

  const exportAllData = () => {
    const exportData = users.map((u) => ({
      username: u.username,
      role: u.role,
      totalCerts: u.certifications?.length || 0,
      certifications: u.certifications || [],
    }));
    exportToJSON(
      exportData,
      `admin-export-${new Date().toISOString().split("T")[0]}.json`
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-bold">
            Admin Dashboard 📊
          </h1>
          <button
            onClick={exportAllData}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition flex items-center gap-2"
          >
            <Download size={18} />
            Export Data
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-white/10">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-6 py-3 font-semibold transition border-b-2 ${
              activeTab === "dashboard"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("renewals")}
            className={`px-6 py-3 font-semibold transition border-b-2 ${
              activeTab === "renewals"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            Renewal Requests
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div>
            {/* Key Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/10 hover:border-blue-500 transition">
                <div className="flex items-center justify-between mb-2">
                  <Users className="text-blue-400" size={24} />
                  <span className="text-2xl font-bold text-blue-400">
                    {stats.totalUsers}
                  </span>
                </div>
                <p className="text-sm text-gray-400">
                  Total Users
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/10 hover:border-purple-500 transition">
                <div className="flex items-center justify-between mb-2">
                  <FileText
                    className="text-purple-400"
                    size={24}
                  />
                  <span className="text-2xl font-bold text-purple-400">
                    {stats.totalCerts}
                  </span>
                </div>
                <p className="text-sm text-gray-400">
                  Total Certs
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/10 hover:border-green-500 transition">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle
                    className="text-green-400"
                    size={24}
                  />
                  <span className="text-2xl font-bold text-green-400">
                    {stats.activeCerts}
                  </span>
                </div>
                <p className="text-sm text-gray-400">
                  Active
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/10 hover:border-yellow-500 transition">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="text-yellow-400" size={24} />
                  <span className="text-2xl font-bold text-yellow-400">
                    {stats.expiringSoon}
                  </span>
                </div>
                <p className="text-sm text-gray-400">
                  Expiring Soon
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/10 hover:border-red-500 transition">
                <div className="flex items-center justify-between mb-2">
                  <AlertCircle
                    className="text-red-400"
                    size={24}
                  />
                  <span className="text-2xl font-bold text-red-400">
                    {stats.expiredCerts}
                  </span>
                </div>
                <p className="text-sm text-gray-400">
                  Expired
                </p>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Certificate Status */}
              <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/10">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <PieChartIcon size={24} />
                  Certificate Status
                </h2>
                {certsByStatus.length > 0 && (
                  <ResponsiveContainer
                    width="100%"
                    height={300}
                  >
                    <PieChart>
                      <Pie
                        data={certsByStatus}
                        dataKey="value"
                        outerRadius={100}
                        label
                      >
                        {certsByStatus.map(
                          (entry, index) => (
                            <Cell
                              key={index}
                              fill={
                                COLORS[
                                  index % COLORS.length
                                ]
                              }
                            />
                          )
                        )}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* User Growth */}
              <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/10">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <TrendingUp size={24} />
                  User Growth
                </h2>
                {userGrowth.length > 0 && (
                  <ResponsiveContainer
                    width="100%"
                    height={300}
                  >
                    <LineChart data={userGrowth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="users"
                        stroke="#3b82f6"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Certs by Category */}
              {certsByCategory.length > 0 && (
                <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/10">
                  <h2 className="text-xl font-semibold mb-6">
                    Certifications by Category
                  </h2>
                  <ResponsiveContainer
                    width="100%"
                    height={300}
                  >
                    <BarChart data={certsByCategory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Top Users */}
              <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/10">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <BarChart3 size={24} />
                  Top Users by Certs
                </h2>
                <div className="space-y-3">
                  {topUsers.map((user, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center bg-white/5 p-4 rounded-lg"
                    >
                      <div>
                        <p className="font-semibold">
                          {user.username}
                        </p>
                        <p className="text-xs text-gray-400">
                          {user.role.toUpperCase()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-blue-400">
                          {user.count}
                        </p>
                        <p className="text-xs text-gray-400">
                          certificates
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/10">
              <h2 className="text-xl font-semibold mb-6">
                Summary
              </h2>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-gray-400 mb-2">
                    Completion Rate
                  </p>
                  <p className="text-3xl font-bold text-blue-400">
                    {stats.totalCerts > 0
                      ? Math.round(
                          (stats.activeCerts /
                            stats.totalCerts) *
                            100
                        )
                      : 0}
                    %
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 mb-2">
                    Avg Certs per User
                  </p>
                  <p className="text-3xl font-bold text-green-400">
                    {stats.totalUsers > 0
                      ? (
                          stats.totalCerts /
                          stats.totalUsers
                        ).toFixed(1)
                      : 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 mb-2">
                    At-Risk Percentage
                  </p>
                  <p className="text-3xl font-bold text-red-400">
                    {stats.totalCerts > 0
                      ? Math.round(
                          ((stats.expiredCerts +
                            stats.expiringSoon) /
                            stats.totalCerts) *
                            100
                        )
                      : 0}
                    %
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Renewals Tab */}
        {activeTab === "renewals" && (
          <div className="space-y-6">
            {users.map((user) => {
              const renewalRequests = user.certifications?.filter(
                (c) => c.renewalRequest
              ) || [];

              if (renewalRequests.length === 0)
                return null;

              return (
                <div
                  key={user.username}
                  className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/10"
                >
                  <h2 className="text-2xl font-bold mb-6">
                    {user.username}
                  </h2>
                  <div className="space-y-4">
                    {renewalRequests.map((cert) => (
                      <div
                        key={cert.id}
                        className="bg-white/5 border border-yellow-500/30 p-6 rounded-2xl"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">
                              {cert.name}
                            </h3>
                            <p className="text-gray-400">
                              {cert.organization}
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                              Current Expiry:{" "}
                              {cert.expiryDate}
                            </p>
                            <p className="text-sm text-gray-500">
                              New Expiry:{" "}
                              {cert.newExpiryDate}
                            </p>
                          </div>
                          <span className="px-4 py-2 bg-yellow-600 rounded-lg">
                            Pending Approval
                          </span>
                        </div>

                        {cert.newFile && (
                          <a
                            href={cert.newFile.data}
                            download={cert.newFile.name}
                            className="text-blue-400 underline block mb-4"
                          >
                            Download Updated Certificate
                          </a>
                        )}

                        <div className="flex gap-3">
                          <button
                            onClick={() =>
                              approveRenewal(
                                user.username,
                                cert.id
                              )
                            }
                            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition font-semibold"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              rejectRenewal(
                                user.username,
                                cert.id
                              )
                            }
                            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition font-semibold"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {!users.some(
              (u) =>
                u.certifications?.filter(
                  (c) => c.renewalRequest
                ).length > 0
            ) && (
              <div className="bg-white/10 p-8 rounded-2xl text-center">
                <p className="text-gray-400">
                  No pending renewal requests
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default AdminDashboard;