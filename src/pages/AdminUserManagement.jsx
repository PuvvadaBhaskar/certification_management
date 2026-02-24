import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { Download, Upload, History, Trash2 } from "lucide-react";
import { exportToJSON } from "../utils/pdfExport";
import { getAllActivities } from "../utils/auditLog";

function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [activeTab, setActiveTab] = useState("management");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const stored =
      JSON.parse(localStorage.getItem("users")) || [];
    // eslint-disable-next-line
    setUsers(stored);
    setActivities(getAllActivities());
  }, []);

  const deleteUser = (username) => {
    if (!window.confirm(
      `Delete user "${username}"? This action cannot be undone.`
    ))
      return;

    const updated = users.filter(
      (u) => u.username !== username
    );
    localStorage.setItem("users", JSON.stringify(updated));
    setUsers(updated);
  };

  const changeRole = (username) => {
    const updated = users.map((u) =>
      u.username === username
        ? {
            ...u,
            role: u.role === "admin" ? "user" : "admin",
          }
        : u
    );

    localStorage.setItem("users", JSON.stringify(updated));
    setUsers(updated);
  };

  const exportUsers = () => {
    const dataToExport = users.map((u) => ({
      username: u.username,
      role: u.role,
      certifications: u.certifications?.length || 0,
      createdDate: u.createdDate || "N/A",
    }));
    exportToJSON(
      dataToExport,
      `users-export-${new Date().toISOString().split("T")[0]}.json`
    );
  };

  const handleImportUsers = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      try {
        const importedUsers = JSON.parse(reader.result);
        const merged = [...users];

        importedUsers.forEach((importedUser) => {
          const existingIndex = merged.findIndex(
            (u) => u.username === importedUser.username
          );
          if (existingIndex >= 0) {
            merged[existingIndex] = {
              ...merged[existingIndex],
              ...importedUser,
            };
          } else {
            merged.push(importedUser);
          }
        });

        localStorage.setItem(
          "users",
          JSON.stringify(merged)
        );
        setUsers(merged);
        alert(
          `Successfully imported ${importedUsers.length} users`
        );
      } catch {
        alert("Invalid file format");
      }
    };
    reader.readAsText(file);
  };

  const filteredUsers = users.filter((u) =>
    u.username
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">
          User Management 👥
        </h1>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-white/10">
          <button
            onClick={() => setActiveTab("management")}
            className={`px-6 py-3 font-semibold transition border-b-2 ${
              activeTab === "management"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`px-6 py-3 font-semibold transition border-b-2 flex items-center gap-2 ${
              activeTab === "audit"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            <History size={18} />
            Audit Log
          </button>
        </div>

        {/* User Management Tab */}
        {activeTab === "management" && (
          <div className="space-y-6">
            {/* Search & Export Controls */}
            <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/10 flex gap-4 items-center flex-wrap">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 min-w-64 px-4 py-2 bg-white/5 border border-white/10 rounded-lg outline-none text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={exportUsers}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition flex items-center gap-2"
              >
                <Download size={18} />
                Export
              </button>
              <label className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition flex items-center gap-2 cursor-pointer">
                <Upload size={18} />
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportUsers}
                  className="hidden"
                />
              </label>
            </div>

            {/* Users List */}
            {filteredUsers.length > 0 ? (
              <div className="space-y-3">
                {filteredUsers.map((user, i) => (
                  <div
                    key={i}
                    className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/10 hover:border-white/20 transition"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-semibold text-lg">
                            {user.username}
                          </p>
                          <span
                            className={`px-3 py-1 text-xs rounded-full font-semibold ${
                              user.role === "admin"
                                ? "bg-red-600"
                                : "bg-blue-600"
                            }`}
                          >
                            {user.role.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-400 space-y-1">
                          <p>
                            Certifications:{" "}
                            <span className="text-white font-semibold">
                              {user.certifications?.length ||
                                0}
                            </span>
                          </p>
                          {user.createdDate && (
                            <p>
                              Joined:{" "}
                              <span className="text-white">
                                {user.createdDate}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            changeRole(user.username)
                          }
                          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition font-semibold text-sm"
                        >
                          {user.role === "admin"
                            ? "Make User"
                            : "Make Admin"}
                        </button>

                        <button
                          onClick={() =>
                            deleteUser(user.username)
                          }
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition flex items-center gap-2"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/10 p-8 rounded-2xl text-center text-gray-400">
                No users found
              </div>
            )}
          </div>
        )}

        {/* Audit Log Tab */}
        {activeTab === "audit" && (
          <div className="bg-white/10 backdrop-blur-xl p-8 rounded-2xl border border-white/10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">
                System Activity Log
              </h2>
              <button
                onClick={() =>
                  exportToJSON(
                    activities,
                    `audit-log-${new Date().toISOString().split("T")[0]}.json`
                  )
                }
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition flex items-center gap-2"
              >
                <Download size={18} />
                Export Log
              </button>
            </div>

            {activities.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {[...activities]
                  .reverse()
                  .map((activity) => (
                    <div
                      key={activity.id}
                      className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition"
                    >
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <div>
                          <p className="font-semibold text-blue-400">
                            {activity.action
                              .replace(/_/g, " ")
                              .toUpperCase()}
                          </p>
                          <p className="text-sm text-gray-400 mt-1">
                            User: <span className="text-white">{activity.username}</span>
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 whitespace-nowrap">
                          {new Date(
                            activity.timestamp
                          ).toLocaleDateString()}{" "}
                          {new Date(
                            activity.timestamp
                          ).toLocaleTimeString()}
                        </p>
                      </div>
                      {activity.details && (
                        <p className="text-sm text-gray-400">
                          {activity.details}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">
                No activity recorded yet
              </p>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default AdminUserManagement;