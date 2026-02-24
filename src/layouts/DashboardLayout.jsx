import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { GlobalSearch } from "../components/GlobalSearch";
import { useTheme } from "../context/ThemeContext";
import appConfig from "../config/appConfig";

function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const [username, setUsername] = useState(() =>
    localStorage.getItem("username") || ""
  );
  const [role, setRole] = useState(() =>
    localStorage.getItem("role") || ""
  );

  useEffect(() => {
    const handleStorageChange = () => {
      setUsername(localStorage.getItem("username") || "");
      setRole(localStorage.getItem("role") || "");
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const logout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    navigate("/");
  };

  const isActive = (path) =>
    location.pathname === path;

  const navItem = (path, label, icon) => (
    <Link
      to={path}
      className={`flex items-center gap-3 px-5 py-3 rounded-xl mb-3 transition-all duration-300 ${
        isActive(path)
          ? "bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg"
          : "hover:bg-white/10"
      }`}
    >
      <span className="text-lg">{icon}</span>
      {label}
    </Link>
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-950 via-black to-blue-900 text-white">

      {/* Sidebar */}
      <div className="w-64 bg-black/40 backdrop-blur-xl p-6 flex flex-col justify-between border-r border-white/10">

        <div>
          <h1 className="text-2xl font-bold mb-10 tracking-wide">
            {appConfig.appName} {appConfig.appEmoji}
          </h1>

          {role === "admin" ? (
            <>
              {navItem("/admin/dashboard", "Dashboard", "📊")}
              {navItem("/admin/users", "User Management", "👥")}
              {navItem("/admin/certifications", "Manage Certifications", "📜")}
              {navItem("/admin/certificate-management", "Certificate Management", "🏢")}
              {navItem("/admin/notifications", "Send Notifications", "📢")}
              {navItem("/admin/system-config", "System Config", "⚙️")}
              {navItem("/admin/analytics", "Analytics & Reports", "📈")}
            </>
          ) : (
            <>
              {navItem("/user/dashboard", "Dashboard", "📊")}
              {navItem("/user/certifications", "My Certifications", "📜")}
              {navItem("/notifications", "Notifications", "🔔")}
              {navItem("/add-certification", "Add Certification", "➕")}
              {navItem("/profile", "Profile", "👤")}
            </>
          )}
        </div>

        <button
          onClick={logout}
          className="w-full bg-red-600 py-2 rounded-xl hover:scale-105 transition duration-300"
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">

        {/* Top Bar */}
        <div className="flex justify-between items-center px-10 py-4 border-b border-white/10 bg-black/20 backdrop-blur-lg">
          <h2 className="text-xl font-semibold capitalize">
            {location.pathname.split("/")[2] || "Dashboard"}
          </h2>

          <div className="flex items-center gap-4">
            {/* Global Search */}
            <GlobalSearch />

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
              title={isDark ? "Light mode" : "Dark mode"}
            >
              {isDark ? (
                <Sun size={20} />
              ) : (
                <Moon size={20} />
              )}
            </button>

            {/* User Info */}
            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center font-bold">
                {username?.charAt(0).toUpperCase()}
              </div>
              <span className="capitalize">{username}</span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-10 overflow-y-auto">
          {children}
        </div>

      </div>
    </div>
  );
}

export default DashboardLayout;