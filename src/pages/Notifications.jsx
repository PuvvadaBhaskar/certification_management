import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import { Bell, Trash2, CheckCircle, AlertCircle, Loader } from "lucide-react";
import {
  getNotifications,
  markAsRead,
  deleteNotification,
} from "../apis/notificationService";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);
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

  const fetchNotifications = useCallback(async () => {
    try {
      if (!userId) {
        navigate("/");
        return;
      }

      setLoading(true);
      setError(null);
      const response = await getNotifications(userId);
      setNotifications(response.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch notifications"
      );
    } finally {
      setLoading(false);
    }
  }, [userId, navigate]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(
        notifications.map((notif) =>
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to mark as read");
    }
  };

  const handleDelete = async (id) => {
    try {
      setDeleting(id);
      await deleteNotification(id);
      setNotifications(notifications.filter((notif) => notif.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete notification");
    } finally {
      setDeleting(null);
    }
  };

  const getFilteredNotifications = () => {
    if (filter === "all") return notifications;
    if (filter === "unread") return notifications.filter((n) => !n.read);
    if (filter === "read") return notifications.filter((n) => n.read);
    return notifications;
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <Loader className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-gray-400">Loading notifications...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Bell className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-4xl font-bold">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-400">
                  {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            {
              label: "All",
              value: "all",
              count: notifications.length,
            },
            {
              label: "Unread",
              value: "unread",
              count: unreadCount,
            },
            {
              label: "Read",
              value: "read",
              count: notifications.filter((n) => n.read).length,
            },
          ].map((btn) => (
            <button
              key={btn.value}
              onClick={() => setFilter(btn.value)}
              className={`px-4 py-2 rounded-lg transition ${
                filter === btn.value
                  ? "bg-blue-600 text-white"
                  : "bg-white/10 hover:bg-white/20 text-gray-300"
              }`}
            >
              {btn.label}
              <span className="ml-2 text-xs">({btn.count})</span>
            </button>
          ))}
        </div>

        {/* Notifications List */}
        {getFilteredNotifications().length === 0 ? (
          <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-12 text-center">
            <Bell className="w-16 h-16 mx-auto mb-4 text-gray-500" />
            <h2 className="text-xl font-semibold text-gray-300">
              No notifications
            </h2>
            <p className="text-gray-400 mt-2">
              You're all caught up! No {filter !== "all" ? filter : ""}{" "}
              notifications at this time.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {getFilteredNotifications().map((notif) => (
              <div
                key={notif.id}
                className={`bg-white/5 backdrop-blur-lg rounded-lg border border-white/10 p-4 hover:border-white/20 transition ${
                  notif.read ? "opacity-60" : "opacity-100"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      {notif.read ? (
                        <CheckCircle className="w-5 h-5 text-gray-500 flex-shrink-0 mt-1" />
                      ) : (
                        <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-white">
                          {notif.title || "Notification"}
                        </h3>
                        <p className="text-gray-300 mt-1 break-words">
                          {notif.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(notif.createdAt || Date.now()).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    {!notif.read && (
                      <button
                        onClick={() => handleMarkAsRead(notif.id)}
                        title="Mark as read"
                        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notif.id)}
                      disabled={deleting === notif.id}
                      title="Delete"
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition disabled:opacity-50"
                    >
                      {deleting === notif.id ? (
                        <Loader className="w-5 h-5 animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
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
