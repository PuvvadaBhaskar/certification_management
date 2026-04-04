import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { Send, Users, MessageSquare, History, X } from "lucide-react";
import { logActivity } from "../utils/auditLog";
import api from "../api/axios";
import { sendNotification } from "../api/notification";

function AdminNotifications() {
  const [users, setUsers] = useState([]);
  const [usersLoadError, setUsersLoadError] = useState("");
  const [usersLoadDebug, setUsersLoadDebug] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [activeTab, setActiveTab] = useState("send");
  const [notifications, setNotifications] = useState([]);
  const [sendAllMode, setSendAllMode] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadUsers();
    loadNotifications();
  }, []);

  const loadUsers = async () => {
    try {
      setUsersLoadError("");
      const hasToken = Boolean(
        localStorage.getItem("token") || localStorage.getItem("accessToken")
      );
      console.log("[AdminNotifications] Fetch users start", {
        endpoint: "/users",
        hasBearerToken: hasToken,
      });

      let response;
      let endpointUsed = "/users";

      try {
        response = await api.get("/users");
      } catch (firstError) {
        const firstStatus = firstError?.response?.status;
        console.log("[AdminNotifications] /users failed, trying /admin/users", {
          status: firstStatus,
          body: firstError?.response?.data,
        });
        endpointUsed = "/admin/users";
        response = await api.get("/admin/users");
      }

      const backendUsers = Array.isArray(response?.data) ? response.data : [];

      setUsersLoadDebug({
        endpoint: endpointUsed,
        status: response?.status,
        bodyType: Array.isArray(response?.data) ? "array" : typeof response?.data,
        count: backendUsers.length,
      });

      console.log("[AdminNotifications] Fetch users success", {
        endpoint: endpointUsed,
        status: response?.status,
        count: backendUsers.length,
        sample: backendUsers[0],
      });

      const normalizedUsers = backendUsers
        .map((u, index) => ({
        id: Number(u.id),
        username: u.name || u.username || u.email || `user-${index + 1}`,
        role: (u.role || "USER").toLowerCase(),
      }))
        .filter((u) => Number.isFinite(u.id));

      setUsers(normalizedUsers);
    } catch (err) {
      console.error("Error loading users:", err);
      console.error("[AdminNotifications] Fetch users failed", {
        status: err?.response?.status,
        body: err?.response?.data,
      });
      setUsers([]);
      const status = err?.response?.status;
      const body = err?.response?.data;
      const errorMessage =
        body?.message ||
        body?.error ||
        err?.message ||
        "Failed to load recipients from backend";

      setUsersLoadError(`Recipients load failed (${status || "unknown"}): ${errorMessage}`);
      setUsersLoadDebug({
        endpoint: "/users or /admin/users",
        status: status || "unknown",
        body,
      });
      alert(err?.response?.data?.message || "Failed to load recipients from backend");
    }
  };

  const userRecipients = useMemo(
    () => users.filter((u) => (u.role || "").toLowerCase() !== "admin"),
    [users]
  );

  const loadNotifications = () => {
    const allNotifs = JSON.parse(
      localStorage.getItem("adminNotifications") || "[]"
    );
    setNotifications(allNotifs);
  };

  const toggleRecipient = (userId) => {
    const normalizedUserId = Number(userId);
    if (!Number.isFinite(normalizedUserId)) return;

    if (selectedUsers.includes(normalizedUserId)) {
      setSelectedUsers((prev) => prev.filter((id) => id !== normalizedUserId));
    } else {
      setSelectedUsers((prev) => [...prev, normalizedUserId]);
    }
  };

  const handleSendNotification = async (mode = "in_app") => {
    if (!title.trim() || !message.trim()) {
      alert("Title and message are required");
      return;
    }

    const selectedUserIds = sendAllMode
      ? userRecipients.map((u) => Number(u.id)).filter((id) => Number.isFinite(id))
      : selectedUsers;

    console.log("Selected Users:", selectedUserIds);

    if (selectedUserIds.length === 0) {
      alert("Select at least one recipient");
      return;
    }

    const adminUsername = localStorage.getItem("username");
    const recipientUsernames = userRecipients
      .filter((u) => selectedUserIds.includes(Number(u.id)))
      .map((u) => u.username);
    const finalMessage = title.trim()
      ? `${title.trim()}: ${message.trim()}`
      : message.trim();

    const sentAt = new Date().toISOString();
    const sendingLabel = mode === "email" ? "email notification" : "notification";

    try {
      setSending(true);
      for (const userId of selectedUserIds) {
        const payload = {
          userId: Number(userId),
          message: finalMessage,
          type: mode === "email" ? "EMAIL" : "IN_APP",
        };
        console.log("Sending payload:", payload);
        await sendNotification(payload);
      }
    } catch (err) {
      console.error("Error sending notification:", err);
      alert(err.response?.data?.message || `Failed to send ${sendingLabel}`);
      return;
    } finally {
      setSending(false);
    }

    const notification = {
      id: Date.now(),
      title: title.trim(),
      message: message.trim(),
      sendBy: adminUsername,
      recipients: recipientUsernames,
      sentAt,
      source: "backend",
    };

    const allNotifs = JSON.parse(localStorage.getItem("adminNotifications") || "[]");
    allNotifs.push(notification);
    localStorage.setItem("adminNotifications", JSON.stringify(allNotifs));

    logActivity(
      adminUsername,
      mode === "email" ? "send_bulk_email_notification" : "send_bulk_notification",
      `Sent ${sendingLabel} "${title.trim()}" to ${selectedUserIds.length} users`
    );

    alert(
      `${mode === "email" ? "Email notification" : "Notification"} sent to ${selectedUserIds.length} user${selectedUserIds.length !== 1 ? "s" : ""}!`
    );

    setTitle("");
    setMessage("");
    setSelectedUsers([]);
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
                  {usersLoadError && (
                    <div className="p-3 mb-2 rounded-lg border border-red-500/40 bg-red-500/10 text-red-300 text-sm">
                      <p className="font-semibold">Unable to load recipients</p>
                      <p className="mt-1">{usersLoadError}</p>
                      {usersLoadDebug && (
                        <p className="mt-1 text-red-200/90">
                          Endpoint: {usersLoadDebug.endpoint} | Status: {String(usersLoadDebug.status)}
                        </p>
                      )}
                    </div>
                  )}

                  {!usersLoadError && userRecipients.length === 0 && (
                    <div className="p-3 mb-2 rounded-lg border border-yellow-500/40 bg-yellow-500/10 text-yellow-200 text-sm">
                      No recipients found. If users exist, click the refresh button and check token/session.
                    </div>
                  )}

                  {userRecipients.map((user) => (
                    <label
                      key={user.id}
                      className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(Number(user.id))}
                        onChange={() =>
                          toggleRecipient(user.id)
                        }
                        className="w-4 h-4"
                      />
                      <span>{user.username}</span>
                      <span className="text-xs text-gray-500">
                        {String(user.role || "user").toUpperCase()}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              <p className="text-sm text-gray-400 mt-4">
                {sendAllMode
                  ? `Will send to all ${userRecipients.length} users`
                  : `${selectedUsers.length} user${selectedUsers.length !== 1 ? "s" : ""} selected`}
              </p>
            </div>

            {/* Send Buttons */}
            <div className="grid gap-4 md:grid-cols-2">
              <button
                onClick={() => handleSendNotification("in_app")}
                disabled={sending}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:scale-105 transition rounded-2xl font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-60 disabled:hover:scale-100"
              >
                <Send size={24} />
                {sending ? "Sending..." : "Send In-App Notification"}
              </button>
              <button
                onClick={() => handleSendNotification("email")}
                disabled={sending}
                className="w-full px-6 py-4 bg-gradient-to-r from-emerald-500 to-cyan-600 hover:scale-105 transition rounded-2xl font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-60 disabled:hover:scale-100"
              >
                <Send size={24} />
                {sending ? "Sending..." : "Send Email Notification"}
              </button>
            </div>
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
