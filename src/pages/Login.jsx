import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [popup, setPopup] = useState(null);
  const navigate = useNavigate();

  // 🔥 AUTO CREATE ADMIN (System Controlled)
  useEffect(() => {
    const users = JSON.parse(localStorage.getItem("users")) || [];

    const adminExists = users.find(
      (u) => u.role === "admin"
    );

    if (!adminExists) {
      users.push({
        username: "admin",
        password: "admin123",
        role: "admin",
        certifications: [],
      });

      localStorage.setItem("users", JSON.stringify(users));
    }
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!username.trim()) newErrors.username = "Username is required";
    if (username.length < 3) newErrors.username = "Username must be at least 3 characters";
    if (!password) newErrors.password = "Password is required";
    if (password.length < 4) newErrors.password = "Password must be at least 4 characters";
    return newErrors;
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setErrors({});

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem("users")) || [];
      const user = users.find(
        (u) => u.username === username && u.password === password
      );

      if (!user) {
        setLoading(false);
        setPopup({ type: "error", message: "Invalid username or password!" });
        return;
      }

      localStorage.setItem("username", user.username);
      localStorage.setItem("role", user.role);
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
      }

      setLoading(false);
      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/user/dashboard");
      }
    }, 800);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-black to-blue-900 text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>

      <form
        onSubmit={handleLogin}
        className="relative bg-white/10 backdrop-blur-xl p-8 rounded-3xl w-full max-w-md shadow-2xl border border-white/10 hover:border-white/20 transition"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Welcome Back 🔐
          </h2>
          <p className="text-gray-400 text-sm">Sign in to access your certifications</p>
        </div>

        {/* Demo Credentials Hint */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-6 text-xs">
          <p className="text-blue-300"><strong>Demo:</strong> admin / admin123</p>
        </div>

        {/* Username Field */}
        <div className="mb-5">
          <label className="block text-sm font-semibold mb-2 text-gray-200">Username</label>
          <div className="relative">
            <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-lg bg-black/40 border transition focus:outline-none ${
                errors.username
                  ? "border-red-500 focus:ring-2 focus:ring-red-500"
                  : "border-white/10 focus:ring-2 focus:ring-purple-500"
              }`}
            />
          </div>
          {errors.username && (
            <p className="text-red-400 text-xs mt-1.5">{errors.username}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2 text-gray-200">Password</label>
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full pl-10 pr-12 py-3 rounded-lg bg-black/40 border transition focus:outline-none ${
                errors.password
                  ? "border-red-500 focus:ring-2 focus:ring-red-500"
                  : "border-white/10 focus:ring-2 focus:ring-purple-500"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-400 text-xs mt-1.5">{errors.password}</p>
          )}
        </div>

        {/* Remember Me */}
        <label className="flex items-center gap-2 mb-6 cursor-pointer hover:opacity-80 transition">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded accent-purple-500"
          />
          <span className="text-sm text-gray-300">Remember me</span>
        </label>

        {/* Login Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-600 py-3 rounded-xl hover:scale-105 transition duration-300 font-semibold disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </button>

        {/* Links */}
        <div className="mt-6 space-y-3 text-center text-sm">
          <p className="text-gray-300">
            Don't have an account?{" "}
            <Link to="/register" className="text-purple-400 hover:text-purple-300 font-semibold">
              Create one
            </Link>
          </p>
          <Link to="#" className="text-gray-400 hover:text-gray-300 text-xs block">
            Forgot password?
          </Link>
        </div>
      </form>

      {/* Error Popup */}
      {popup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-50">
          <div className="bg-white/10 p-8 rounded-3xl shadow-[0_0_40px_rgba(239,68,68,0.8)] text-center border border-red-500/20 animate-fadeIn">
            <div className="text-5xl mb-4">❌</div>
            <h3 className="text-xl font-bold mb-4 text-red-300">{popup.message}</h3>
            <button
              onClick={() => setPopup(null)}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition font-semibold"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default Login;