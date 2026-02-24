import { useState, useEffect } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { Lock, Eye, EyeOff, History } from "lucide-react";
import { getUserActivities, logActivity } from "../utils/auditLog";

function Profile() {
  const [user, setUser] = useState({});
  const [image, setImage] = useState(null);
  const [nickname, setNickname] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [activities, setActivities] = useState([]);
  const [activeTab, setActiveTab] = useState("settings");

  useEffect(() => {
    const username = localStorage.getItem("username");
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const currentUser = users.find((u) => u.username === username);

    if (currentUser) {
      // eslint-disable-next-line
      setUser(currentUser);
      setImage(currentUser.image || null);
      setNickname(currentUser.nickname || "");
      if (username) {
        setActivities(getUserActivities(username));
      }
    }
  }, []);

  const updateUser = (updatedFields) => {
    const users = JSON.parse(localStorage.getItem("users")) || [];

    const updatedUsers = users.map((u) =>
      u.username === user.username
        ? { ...u, ...updatedFields }
        : u
    );

    localStorage.setItem("users", JSON.stringify(updatedUsers));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      const base64 = reader.result;
      setImage(base64);
      updateUser({ image: base64 });
      logActivity(
        user.username,
        "update_profile_photo",
        "Changed profile picture"
      );
    };

    reader.readAsDataURL(file);
  };

  const handleSaveNickname = () => {
    if (!nickname.trim()) {
      alert("Nickname cannot be empty");
      return;
    }
    updateUser({ nickname });
    logActivity(
      user.username,
      "update_nickname",
      `Changed nickname to "${nickname}"`
    );
    alert("Nickname updated!");
  };

  const handleChangePassword = () => {
    if (!newPassword || !confirmPassword) {
      alert("Please fill in all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }
    updateUser({ password: newPassword });
    logActivity(
      user.username,
      "change_password",
      "Changed account password"
    );
    alert("Password updated!");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">
          Profile 👤
        </h1>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-white/10">
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-6 py-3 font-semibold transition border-b-2 ${
              activeTab === "settings"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            Settings
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={`px-6 py-3 font-semibold transition border-b-2 flex items-center gap-2 ${
              activeTab === "activity"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            <History size={18} />
            Activity
          </button>
        </div>

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Profile Photo & Basic Info */}
            <div className="bg-white/10 backdrop-blur-xl p-10 rounded-3xl shadow-[0_0_60px_rgba(59,130,246,0.3)]">
              <div className="flex flex-col items-center">
                {/* Avatar */}
                <div className="relative mb-6 group">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 blur-lg opacity-70 group-hover:opacity-100 transition"></div>
                  <div className="relative w-40 h-40 rounded-full p-[3px] bg-gradient-to-r from-blue-500 to-purple-600">
                    <img
                      src={
                        image ||
                        "https://i.imgur.com/HeIi0wU.png"
                      }
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover bg-black"
                    />
                  </div>
                  <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-2 border-black rounded-full animate-pulse"></div>
                </div>

                {/* Upload Button */}
                <label className="cursor-pointer mb-8">
                  <span className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow hover:scale-105 transition inline-block">
                    Change Photo
                  </span>
                  <input
                    type="file"
                    onChange={handleImage}
                    className="hidden"
                  />
                </label>

                {/* User Info */}
                <p className="text-2xl font-semibold mb-2">
                  {user?.username}
                </p>
                <p className="text-gray-400 capitalize mb-8">
                  {user?.role}
                </p>

                {/* Certifications Count */}
                <div className="w-full bg-black/20 rounded-lg p-4 text-center">
                  <p className="text-gray-400 text-sm">
                    Total Certifications
                  </p>
                  <p className="text-2xl font-bold text-blue-400 mt-1">
                    {user?.certifications?.length || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Nickname & Password */}
            <div className="space-y-6">
              {/* Nickname Card */}
              <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/10">
                <h3 className="text-lg font-semibold mb-4">
                  Display Name
                </h3>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) =>
                    setNickname(e.target.value)
                  }
                  placeholder="Set your nickname"
                  className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 text-white placeholder-gray-500"
                />
                <button
                  onClick={handleSaveNickname}
                  className="w-full py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:scale-105 transition font-semibold"
                >
                  Save Nickname
                </button>
              </div>

              {/* Password Card */}
              <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/10">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Lock size={20} />
                  Change Password
                </h3>

                {/* New Password */}
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) =>
                        setNewPassword(e.target.value)
                      }
                      placeholder="Enter new password"
                      className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500"
                    />
                    <button
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      className="absolute right-3 top-3 text-gray-400 hover:text-white"
                    >
                      {showPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    placeholder="Confirm password"
                    className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500"
                  />
                </div>

                {newPassword &&
                  confirmPassword &&
                  newPassword !== confirmPassword && (
                    <p className="text-red-400 text-sm mb-4">
                      Passwords do not match
                    </p>
                  )}

                <button
                  onClick={handleChangePassword}
                  className="w-full py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105 transition font-semibold"
                >
                  Update Password
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === "activity" && (
          <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/10">
            <h2 className="text-2xl font-semibold mb-6">
              Activity History
            </h2>
            {activities.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-semibold text-blue-400">
                        {activity.action
                          .replace(/_/g, " ")
                          .toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-500">
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
                No activity history yet
              </p>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Profile;