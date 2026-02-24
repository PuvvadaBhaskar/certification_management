import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { Bell, AlertCircle, CheckCircle, Settings } from "lucide-react";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [showSettings, setShowSettings] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(
    JSON.parse(localStorage.getItem("notificationPreferences")) || {
      expired: true,
      expiringSoon: true,
    }
  );

  const loadNotifications = () => {
    const username = localStorage.getItem("username");
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const currentUser = users.find((u) => u.username === username);

    if (!currentUser) return [];

    const notifs = [];

    // Check for expired certificates
    currentUser.certifications?.forEach((cert) => {
      const expiryDate = new Date(cert.expiryDate);
      const today = new Date();
      const daysUntilExpiry = Math.ceil(
        (expiryDate - today) / (1000 * 60 * 60 * 24)
      );

      // Notification for expired certificates
      if (today > expiryDate) {
        notifs.push({
          id: cert.id,
          type: "expired",
          title: `Certificate Expired`,
          message: `Your "${cert.name}" certificate expired on ${cert.expiryDate}`,
          date: cert.expiryDate,
          certName: cert.name,
          timestamp: new Date().toISOString(),
          read: false,
        });
      }
      // Notification for certificates expiring soon (within 30 days)
      else if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
        notifs.push({
          id: cert.id,
          type: "expiring-soon",
          title: `Certificate Expiring Soon`,
          message: `Your "${cert.name}" certificate will expire in ${daysUntilExpiry} days (${cert.expiryDate})`,
          date: cert.expiryDate,
          certName: cert.name,
          timestamp: new Date().toISOString(),
          read: false,
        });
      }
    });

    // Load saved notifications from localStorage
    const savedNotifs =
      JSON.parse(
        localStorage.getItem(`notifications_${username}`)
      ) || [];

    // Merge new notifications with saved ones (avoiding duplicates)
    const allNotifs = [...savedNotifs];
    notifs.forEach((newNotif) => {
      if (
        !allNotifs.find(
          (n) => n.id === newNotif.id && n.type === newNotif.type
        )
      ) {
        allNotifs.push(newNotif);
      }
    });

    // Sort by date (newest first)
    allNotifs.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );

    localStorage.setItem(
      `notifications_${username}`,
      JSON.stringify(allNotifs)
    );

    return allNotifs;
  };

  useEffect(() => {
    const notifs = loadNotifications();
    // eslint-disable-next-line
    setNotifications(notifs);
  }, []);

  const savePreferences = () => {
    localStorage.setItem(
      "notificationPreferences",
      JSON.stringify(emailNotifications)
    );
    alert("Notification preferences saved!");
    setShowSettings(false);
  };

  const getFilteredNotifications = () => {
    if (filter === "all") return notifications;
    if (filter === "unread")
      return notifications.filter((n) => !n.read);
    if (filter === "expired")
      return notifications.filter((n) => n.type === "expired");
    if (filter === "expiring-soon")
      return notifications.filter(
        (n) => n.type === "expiring-soon"
      );
    return notifications;
  };

  const markAsRead = (notifId) => {
    const updated = notifications.map((notif) =>
      notif.id === notifId ? { ...notif, read: true } : notif
    );
    setNotifications(updated);

    const username = localStorage.getItem("username");
    localStorage.setItem(
      `notifications_${username}`,
      JSON.stringify(updated)
    );
  };

  const deleteNotification = (notifId) => {
    const updated = notifications.filter(
      (notif) => notif.id !== notifId
    );
    setNotifications(updated);

    const username = localStorage.getItem("username");
    localStorage.setItem(
      `notifications_${username}`,
      JSON.stringify(updated)
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    const username = localStorage.getItem("username");
    localStorage.removeItem(`notifications_${username}`);
  };

  const getNotificationColor = (type) => {
    if (type === "expired") return "bg-red-500/20 border-red-500";
    if (type === "expiring-soon") return "bg-yellow-500/20 border-yellow-500";
    return "bg-blue-500/20 border-blue-500";
  };

  const getNotificationIcon = (type) => {
    if (type === "expired")
      return <AlertCircle className="text-red-500" size={20} />;
    if (type === "expiring-soon")
      return <AlertCircle className="text-yellow-500" size={20} />;
    return <CheckCircle className="text-blue-500" size={20} />;
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Bell size={32} className="text-blue-400" />
            <h1 className="text-4xl font-bold">Notifications 🔔</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowSettings(true)}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition flex items-center gap-2"
            >
              <Settings size={18} />
              Settings
            </button>
            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { label: "All", value: "all" },
            {
              label: "Unread",
              value: "unread",
              count: notifications.filter((n) => !n.read).length,
            },
            {
              label: "Expired",
              value: "expired",
              count: notifications.filter((n) => n.type === "expired")
                .length,
            },
            {
              label: "Expiring Soon",
              value: "expiring-soon",
              count: notifications.filter(
                (n) => n.type === "expiring-soon"
              ).length,
            },
          ].map((btn) => (
            <button
              key={btn.value}
              onClick={() => setFilter(btn.value)}
              className={`px-4 py-2 rounded-lg transition ${
                filter === btn.value
                  ? "bg-blue-600"
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              {btn.label}
              {btn.count !== undefined && (
                <span className="ml-2 text-xs">({btn.count})</span>
              )}
            </button>
          ))}
        </div>

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-gray-900 border border-white/20 rounded-2xl p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-6">
                Notification Preferences
              </h2>
              <div className="space-y-4 mb-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailNotifications.expired}
                    onChange={(e) =>
                      setEmailNotifications({
                        ...emailNotifications,
                        expired: e.target.checked,
                      })
                    }
                    className="w-4 h-4"
                  />
                  <span>Notify when certificate expires</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailNotifications.expiringSoon}
                    onChange={(e) =>
                      setEmailNotifications({
                        ...emailNotifications,
                        expiringSoon: e.target.checked,
                      })
                    }
                    className="w-4 h-4"
                  />
                  <span>Notify when certificate expiring soon (30 days)</span>
                </label>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={savePreferences}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {getFilteredNotifications().length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-12 text-center">
            <Bell size={48} className="mx-auto mb-4 text-gray-500" />
            <h2 className="text-xl font-semibold text-gray-300">
              No notifications
            </h2>
            <p className="text-gray-400 mt-2">
              You'll receive notifications when your certificates are
              about to expire or have expired.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {getFilteredNotifications().map((notif) => (
              <div
                key={`${notif.id}-${notif.type}`}
                className={`bg-white/5 backdrop-blur-xl rounded-2xl border-2 p-6 transition-all duration-300 hover:scale-102 cursor-pointer ${getNotificationColor(
                  notif.type
                )} ${notif.read ? "opacity-60" : "opacity-100"}`}
                onClick={() => {
                  markAsRead(notif.id);
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="mt-1">
                      {getNotificationIcon(notif.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-1">
                        {notif.title}
                      </h3>
                      <p className="text-gray-300">
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(
                          notif.timestamp
                        ).toLocaleDateString()} at{" "}
                        {new Date(
                          notif.timestamp
                        ).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notif.id);
                    }}
                    className="text-gray-400 hover:text-red-500 transition text-xl"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Notifications;
