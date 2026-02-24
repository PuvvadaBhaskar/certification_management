import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { Send, Users, MessageSquare, History, X } from "lucide-react";
import { logActivity } from "../utils/auditLog";

function AdminNotifications() {
  const [users, setUsers] = useState([]);
  const [recipients, setRecipients] = useState(new Set());
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [activeTab, setActiveTab] = useState("send");
  const [notifications, setNotifications] = useState([]);
  const [sendAllMode, setSendAllMode] = useState(false);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("users")) || [];
    setUsers(stored);
    // eslint-disable-next-line
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    const allNotifs = JSON.parse(
      localStorage.getItem("adminNotifications") || "[]"
    );
    setNotifications(allNotifs);
  };

  const toggleRecipient = (username) => {
    const newRecipients = new Set(recipients);
    if (newRecipients.has(username)) {
      newRecipients.delete(username);
    } else {
      newRecipients.add(username);
    }
    setRecipients(newRecipients);
  };

  const sendNotification = () => {
    if (!title.trim() || !message.trim()) {
      alert("Title and message are required");
      return;
    }

    if (sendAllMode) {
      setRecipients(new Set(users.map((u) => u.username)));
    } else if (recipients.size === 0) {
      alert("Select at least one recipient");
      return;
    }

    const adminUsername = localStorage.getItem("username");

    const notification = {
      id: Date.now(),
      title,
      message,
      sendBy: adminUsername,
      recipients: Array.from(recipients),
      sentAt: new Date().toISOString(),
      read: {},
    };

    // Store in adminNotifications for history
    const allNotifs = JSON.parse(
      localStorage.getItem("adminNotifications") || "[]"
    );
    allNotifs.push(notification);
    localStorage.setItem(
      "adminNotifications",
      JSON.stringify(allNotifs)
    );

    // Store in each user's notifications
    users.forEach((u) => {
      if (recipients.has(u.username)) {
        const userNotifs = JSON.parse(
          localStorage.getItem(
            `notifications_${u.username}`
          ) || "[]"
        );
        userNotifs.push({
          id: notification.id,
          type: "admin-message",
          title: `📢 ${title}`,
          message,
          timestamp: notification.sentAt,
          read: false,
          sendBy: adminUsername,
        });
        localStorage.setItem(
          `notifications_${u.username}`,
          JSON.stringify(userNotifs)
        );
      }
    });

    logActivity(
      adminUsername,
      "send_bulk_notification",
      `Sent "${title}" to ${recipients.size} users`
    );

    alert(
      `Notification sent to ${recipients.size} user${recipients.size !== 1 ? "s" : ""}!`
    );

    setTitle("");
    setMessage("");
    setRecipients(new Set());
    setSendAllMode(false);
    loadNotifications();
  };

  const deleteNotificationRecord = (notifId) => {
    if (!window.confirm("Delete this notification?"))
      return;

    const updated = notifications.filter(
      (n) => n.id !== notifId
    );
    localStorage.setItem(
      "adminNotifications",
      JSON.stringify(updated)
    );
    loadNotifications();
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">
          Admin Notifications 📢
        </h1>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-white/10">
          <button
            onClick={() => setActiveTab("send")}
            className={`px-6 py-3 font-semibold transition border-b-2 flex items-center gap-2 ${
              activeTab === "send"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            <Send size={18} />
            Send Notification
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-6 py-3 font-semibold transition border-b-2 flex items-center gap-2 ${
              activeTab === "history"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            <History size={18} />
            History
          </button>
        </div>

        {/* Send Tab */}
        {activeTab === "send" && (
          <div className="space-y-6">
            {/* Title Input */}
            <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/10">
              <label className="block text-lg font-semibold mb-4">
                Notification Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Important: System Maintenance"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg outline-none text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Message Input */}
            <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/10">
              <label className="block text-lg font-semibold mb-4">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your notification message"
                rows={6}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg outline-none text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <p className="text-sm text-gray-400 mt-2">
                {message.length} characters
              </p>
            </div>

            {/* Recipients Selection */}
            <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <label className="text-lg font-semibold flex items-center gap-2">
                  <Users size={20} />
                  Select Recipients
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendAllMode}
                    onChange={(e) =>
                      setSendAllMode(e.target.checked)
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm">
                    Send to All Users
                  </span>
                </label>
              </div>

              {!sendAllMode && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {users.map((user) => (
                    <label
                      key={user.username}
                      className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={recipients.has(
                          user.username
                        )}
                        onChange={() =>
                          toggleRecipient(user.username)
                        }
                        className="w-4 h-4"
                      />
                      <span>{user.username}</span>
                      <span className="text-xs text-gray-500">
                        {user.role.toUpperCase()}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              <p className="text-sm text-gray-400 mt-4">
                {sendAllMode
                  ? `Will send to all ${users.length} users`
                  : `${recipients.size} user${recipients.size !== 1 ? "s" : ""} selected`}
              </p>
            </div>

            {/* Send Button */}
            <button
              onClick={sendNotification}
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:scale-105 transition rounded-2xl font-bold text-lg flex items-center justify-center gap-2"
            >
              <Send size={24} />
              Send Notification
            </button>
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="space-y-4">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/10 hover:border-white/20 transition"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">
                        {notif.title}
                      </h3>
                      <p className="text-sm text-gray-400">
                        Sent by {notif.sendBy} on{" "}
                        {new Date(
                          notif.sentAt
                        ).toLocaleDateString()}{" "}
                        {new Date(
                          notif.sentAt
                        ).toLocaleTimeString()}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        deleteNotificationRecord(notif.id)
                      }
                      className="p-2 hover:bg-red-600/20 rounded-lg transition"
                    >
                      <X size={20} className="text-red-400" />
                    </button>
                  </div>

                  <p className="text-gray-300 mb-4">
                    {notif.message}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 text-xs rounded-full bg-white/10">
                      Recipients: {notif.recipients.length}
                    </span>
                    {notif.recipients.slice(0, 3).map((r) => (
                      <span
                        key={r}
                        className="px-3 py-1 text-xs rounded-full bg-blue-500/20"
                      >
                        {r}
                      </span>
                    ))}
                    {notif.recipients.length > 3 && (
                      <span className="px-3 py-1 text-xs rounded-full bg-white/10">
                        +{notif.recipients.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white/10 p-8 rounded-2xl text-center text-gray-400">
                <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                <p>No notifications sent yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default AdminNotifications;
