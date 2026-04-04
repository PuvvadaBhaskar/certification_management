import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { Settings, Save, RotateCcw, Database, Bell, Shield, Download, AlertCircle } from "lucide-react";
import { logActivity } from "../utils/auditLog";
import { getAllUsers } from "../api/user";
import { getCertificationsByUser } from "../api/certification";

function AdminSystemConfig() {
  const [config, setConfig] = useState({
    expiryWarningDays: 30,
    expiryAlertEnabled: true,
    emailNotificationsEnabled: false,
    autoRenewReminders: true,
    maxLoginAttempts: 5,
    sessionTimeoutMinutes: 30,
    backupFrequency: "weekly",
  });

  const [saved, setSaved] = useState(false);
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalCertifications: 0,
    lastBackup: null,
    logsCount: 0,
  });

  const [showBackupConfirm, setShowBackupConfirm] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line
    loadConfig();
    // eslint-disable-next-line
    loadSystemStats();
  }, []);

  const loadConfig = () => {
    const stored = JSON.parse(
      localStorage.getItem("systemConfig") || "null"
    );
    if (stored) {
      setConfig(stored);
    }
  };

  const loadSystemStats = async () => {
    let users = [];
    let certCount = 0;

    try {
      users = await getAllUsers();
      users = Array.isArray(users) ? users : [];

      const certArrays = await Promise.all(
        users.map(async (user) => {
          if (user?.id === undefined || user?.id === null) {
            return [];
          }

          try {
            const userCerts = await getCertificationsByUser(user.id);
            return Array.isArray(userCerts) ? userCerts : [];
          } catch {
            return [];
          }
        })
      );

      certCount = certArrays.flat().length;
    } catch (error) {
      console.error("Failed to load backend stats:", error);
      users = [];
      certCount = 0;
    }

    const logs = JSON.parse(localStorage.getItem("auditLogs") || "[]");
    const lastBackupTime = localStorage.getItem("lastBackupTime");

    setSystemStats({
      totalUsers: users.length,
      totalCertifications: certCount,
      lastBackup: lastBackupTime
        ? new Date(lastBackupTime).toLocaleString()
        : "Never",
      logsCount: logs.length,
    });
  };

  const handleConfigChange = (key, value) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const saveConfig = () => {
    localStorage.setItem("systemConfig", JSON.stringify(config));
    const adminUsername = localStorage.getItem("username");
    logActivity(
      adminUsername,
      "update_system_config",
      `Updated system configuration`
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const resetConfig = () => {
    if (window.confirm("Reset to default configuration?")) {
      const defaultConfig = {
        expiryWarningDays: 30,
        expiryAlertEnabled: true,
        emailNotificationsEnabled: false,
        autoRenewReminders: true,
        maxLoginAttempts: 5,
        sessionTimeoutMinutes: 30,
        backupFrequency: "weekly",
      };
      setConfig(defaultConfig);
      localStorage.setItem("systemConfig", JSON.stringify(defaultConfig));
      const adminUsername = localStorage.getItem("username");
      logActivity(
        adminUsername,
        "reset_system_config",
        `Reset system configuration to defaults`
      );
    }
  };

  const performBackup = () => {
    collectAllCertifications().then(({ users, certifications }) => {
      const backupData = {
        timestamp: new Date().toISOString(),
        users,
        certifications,
        auditLogs: JSON.parse(localStorage.getItem("auditLogs") || "[]"),
        config: config,
      };

      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `fsad_backup_${new Date().getTime()}.json`;
      link.click();

      localStorage.setItem("lastBackupTime", new Date().toISOString());
      const adminUsername = localStorage.getItem("username");
      logActivity(adminUsername, "system_backup", `Performed system backup`);

      loadSystemStats();
      setShowBackupConfirm(false);
      alert("Backup completed successfully!");
    });
  };

  const collectAllCertifications = async () => {
    try {
      const usersResponse = await getUsers();
      const users = Array.isArray(usersResponse?.data) ? usersResponse.data : [];

      const allCerts = await Promise.all(
        users.map(async (user, index) => {
          const username = user.username || user.name || user.email || `user-${index + 1}`;

          if (user?.id === undefined || user?.id === null) {
            return { username, certs: [] };
          }

          try {
            const certResponse = await getCertifications({ userId: user.id });
            const certs = Array.isArray(certResponse?.data) ? certResponse.data : [];
            return { username, certs };
          } catch {
            return { username, certs: [] };
          }
        })
      );

      return { users, certifications: allCerts };
    } catch {
      return { users: [], certifications: [] };
    }
  };

  const exportLogs = () => {
    const logs = JSON.parse(localStorage.getItem("auditLogs") || "[]");
    const csv =
      "Timestamp,Username,Action,Details\n" +
      logs
        .map(
          (log) =>
            `"${log.timestamp}","${log.username}","${log.action}","${log.details}"`
        )
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `audit_logs_${new Date().getTime()}.csv`;
    link.click();

    const adminUsername = localStorage.getItem("username");
    logActivity(adminUsername, "export_audit_logs", `Exported audit logs`);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Settings size={40} />
          System Configuration
        </h1>
        <p className="text-gray-400 mb-8">
          Manage system-wide settings and preferences
        </p>

        {/* System Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/10">
            <p className="text-gray-400 text-sm">Total Users</p>
            <p className="text-3xl font-bold text-blue-400">
              {systemStats.totalUsers}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/10">
            <p className="text-gray-400 text-sm">Total Certifications</p>
            <p className="text-3xl font-bold text-green-400">
              {systemStats.totalCertifications}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/10">
            <p className="text-gray-400 text-sm">Audit Logs</p>
            <p className="text-3xl font-bold text-purple-400">
              {systemStats.logsCount}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/10">
            <p className="text-gray-400 text-sm">Last Backup</p>
            <p className="text-xs font-mono text-yellow-400">
              {systemStats.lastBackup}
            </p>
          </div>
        </div>

        {/* Configuration Settings */}
        <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/10 mb-8 space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bell size={24} />
            Notification Settings
          </h2>

          <div className="space-y-4">
            {/* Expiry Warning Days */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Certificate Expiry Warning (days before)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={config.expiryWarningDays}
                onChange={(e) =>
                  handleConfigChange(
                    "expiryWarningDays",
                    parseInt(e.target.value)
                  )
                }
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg outline-none text-white focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Users will be alerted this many days before their
                certificate expires
              </p>
            </div>

            {/* Expiry Alert Toggle */}
            <label className="flex items-center gap-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition cursor-pointer">
              <input
                type="checkbox"
                checked={config.expiryAlertEnabled}
                onChange={(e) =>
                  handleConfigChange(
                    "expiryAlertEnabled",
                    e.target.checked
                  )
                }
                className="w-4 h-4"
              />
              <span>Enable Expiry Alerts</span>
            </label>

            {/* Email Notifications */}
            <label className="flex items-center gap-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition cursor-pointer">
              <input
                type="checkbox"
                checked={config.emailNotificationsEnabled}
                onChange={(e) =>
                  handleConfigChange(
                    "emailNotificationsEnabled",
                    e.target.checked
                  )
                }
                className="w-4 h-4"
              />
              <span>Enable Email Notifications</span>
            </label>

            {/* Auto Renew Reminders */}
            <label className="flex items-center gap-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition cursor-pointer">
              <input
                type="checkbox"
                checked={config.autoRenewReminders}
                onChange={(e) =>
                  handleConfigChange(
                    "autoRenewReminders",
                    e.target.checked
                  )
                }
                className="w-4 h-4"
              />
              <span>Auto-send Renewal Reminders</span>
            </label>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/10 mb-8 space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield size={24} />
            Security Settings
          </h2>

          <div className="space-y-4">
            {/* Max Login Attempts */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Maximum Login Attempts
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={config.maxLoginAttempts}
                onChange={(e) =>
                  handleConfigChange(
                    "maxLoginAttempts",
                    parseInt(e.target.value)
                  )
                }
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg outline-none text-white focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Lock account after this many failed login attempts
              </p>
            </div>

            {/* Session Timeout */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                min="5"
                max="480"
                value={config.sessionTimeoutMinutes}
                onChange={(e) =>
                  handleConfigChange(
                    "sessionTimeoutMinutes",
                    parseInt(e.target.value)
                  )
                }
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg outline-none text-white focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Automatically logout users after inactivity
              </p>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/10 mb-8 space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Database size={24} />
            Data Management
          </h2>

          <div className="space-y-4">
            {/* Backup Frequency */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Backup Frequency
              </label>
              <select
                value={config.backupFrequency}
                onChange={(e) =>
                  handleConfigChange("backupFrequency", e.target.value)
                }
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg outline-none text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            {/* Backup Actions */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setShowBackupConfirm(true)}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-105 transition rounded-xl font-semibold flex items-center justify-center gap-2"
              >
                <Download size={20} />
                Backup Now
              </button>
              <button
                onClick={exportLogs}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:scale-105 transition rounded-xl font-semibold flex items-center justify-center gap-2"
              >
                <Download size={20} />
                Export Logs
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={saveConfig}
            className={`flex-1 px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition ${
              saved
                ? "bg-green-500/30 text-green-400"
                : "bg-gradient-to-r from-blue-500 to-purple-600 hover:scale-105"
            }`}
          >
            <Save size={20} />
            {saved ? "✓ Saved" : "Save Configuration"}
          </button>
          <button
            onClick={resetConfig}
            className="px-6 py-3 bg-red-600/20 hover:bg-red-600/30 rounded-xl font-semibold text-red-400 flex items-center justify-center gap-2 transition"
          >
            <RotateCcw size={20} />
            Reset to Defaults
          </button>
        </div>

        {/* Backup Confirmation Modal */}
        {showBackupConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-b from-white/15 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 max-w-md w-full p-8">
              <div className="flex items-center gap-3 mb-6">
                <AlertCircle size={28} className="text-yellow-400" />
                <h3 className="text-xl font-bold">Confirm Backup</h3>
              </div>
              <p className="text-gray-300 mb-8">
                This will create a complete backup of all system data
                including users, certifications, notifications, and audit
                logs. The file will be downloaded to your device.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={performBackup}
                  className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg font-semibold"
                >
                  Backup
                </button>
                <button
                  onClick={() => setShowBackupConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default AdminSystemConfig;
