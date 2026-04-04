import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, CheckCircle, AlertCircle } from "lucide-react";
import { register } from "../api/auth";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [popup, setPopup] = useState(null);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const navigate = useNavigate();

  const trimmedPasswordsMatch =
    password.trim() && password.trim() === confirmPassword.trim();

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { strength: 0, label: "", color: "" };
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;

    const levels = [
      { strength: 0, label: "Very Weak", color: "bg-red-500" },
      { strength: 1, label: "Weak", color: "bg-orange-500" },
      { strength: 2, label: "Fair", color: "bg-yellow-500" },
      { strength: 3, label: "Good", color: "bg-blue-500" },
      { strength: 4, label: "Strong", color: "bg-green-500" },
    ];

    return levels[strength];
  };

  const checkUsernameAvailability = (value) => {
    if (!value.trim()) {
      setUsernameAvailable(null);
      return;
    }

    // Backend duplicate validation is the source of truth at submit time.
    setUsernameAvailable(value.trim().length >= 3);
  };

  const validateForm = () => {
    const newErrors = {};
    const normalizedUsername = username.trim();
    const normalizedPassword = password.trim();
    const normalizedConfirmPassword = confirmPassword.trim();

    if (!normalizedUsername) newErrors.username = "Username is required";
    if (normalizedUsername.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!normalizedPassword) newErrors.password = "Password is required";
    if (normalizedPassword.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!normalizedConfirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    }
    if (normalizedPassword !== normalizedConfirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrors({});

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const normalizedUsername = username.trim();
      const normalizedPassword = password.trim();
      const normalizedEmail = normalizedUsername.includes("@")
        ? normalizedUsername.toLowerCase()
        : `${normalizedUsername.toLowerCase()}@cms.local`;

      console.log("📝 Attempting registration with username:", normalizedUsername);

      // Call backend register API with JSON body
      const createdUser = await register(normalizedUsername, normalizedEmail, normalizedPassword);

      console.log("✅ Registration successful! User ID:", createdUser?.id);

      // Optionally save userId for auto-login convenience
      if (createdUser?.id !== undefined && createdUser?.id !== null) {
        localStorage.setItem("userId", String(createdUser.id));
      }

      setPopup({
        type: "success",
        message: "Registration successful! Please login.",
      });

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      console.error("❌ Registration error:", err);
      
      // Extract error message from backend
      const backendStatus = err?.response?.status;
      const backendData = err?.response?.data;
      
      let errorMessage = "Failed to register user. Please try again.";
      
      if (backendStatus === 409) {
        errorMessage = "User already exists. Try a different username or email.";
      } else if (backendStatus === 400) {
        errorMessage = backendData?.message || "Invalid registration data. Check your inputs.";
      } else if (backendStatus === 500) {
        errorMessage = backendData?.message || "Server error. Please try again later.";
      } else if (backendData?.message) {
        errorMessage = backendData.message;
      } else if (backendData?.error) {
        errorMessage = backendData.error;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      setPopup({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-black to-purple-900 text-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>

      <form
        onSubmit={handleRegister}
        className="relative bg-white/10 backdrop-blur-xl p-8 rounded-3xl w-full max-w-md shadow-2xl border border-white/10 hover:border-white/20 transition"
      >
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Create Account
          </h2>
          <p className="text-gray-400 text-sm">Join us to manage your certifications</p>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-semibold mb-2 text-gray-200">Username</label>
          <div className="relative">
            <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                checkUsernameAvailability(e.target.value);
              }}
              className={`w-full pl-10 pr-10 py-3 rounded-lg bg-black/40 border transition focus:outline-none ${
                errors.username
                  ? "border-red-500 focus:ring-2 focus:ring-red-500"
                  : usernameAvailable === true
                  ? "border-green-500 focus:ring-2 focus:ring-green-500"
                  : "border-white/10 focus:ring-2 focus:ring-blue-500"
              }`}
            />
            {usernameAvailable === true && (
              <CheckCircle size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-400" />
            )}
            {usernameAvailable === false && (
              <AlertCircle size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-400" />
            )}
          </div>
          {errors.username && <p className="text-red-400 text-xs mt-1.5">{errors.username}</p>}
          {usernameAvailable === true && (
            <p className="text-green-400 text-xs mt-1.5">Username format looks good</p>
          )}
        </div>

        <div className="mb-5">
          <label className="block text-sm font-semibold mb-2 text-gray-200">Password</label>
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full pl-10 pr-12 py-3 rounded-lg bg-black/40 border transition focus:outline-none ${
                errors.password
                  ? "border-red-500 focus:ring-2 focus:ring-red-500"
                  : "border-white/10 focus:ring-2 focus:ring-blue-500"
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
          {errors.password && <p className="text-red-400 text-xs mt-1.5">{errors.password}</p>}

          {password && (
            <div className="mt-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${getPasswordStrength(password).color}`}
                    style={{ width: `${(getPasswordStrength(password).strength + 1) * 20}%` }}
                  ></div>
                </div>
                <span className="text-xs font-semibold text-gray-300">{getPasswordStrength(password).label}</span>
              </div>
            </div>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2 text-gray-200">Confirm Password</label>
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full pl-10 pr-12 py-3 rounded-lg bg-black/40 border transition focus:outline-none ${
                errors.confirmPassword
                  ? "border-red-500 focus:ring-2 focus:ring-red-500"
                  : confirmPassword && trimmedPasswordsMatch
                  ? "border-green-500 focus:ring-2 focus:ring-green-500"
                  : "border-white/10 focus:ring-2 focus:ring-blue-500"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-red-400 text-xs mt-1.5">{errors.confirmPassword}</p>}
          {confirmPassword && trimmedPasswordsMatch && !errors.confirmPassword && (
            <p className="text-green-400 text-xs mt-1.5">Passwords match</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 py-3 rounded-xl hover:scale-105 transition duration-300 font-semibold disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>

        <p className="text-center mt-6 text-gray-300 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold">
            Sign in
          </Link>
        </p>
      </form>

      {popup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-50">
          <div
            className={`p-8 rounded-3xl text-center border ${
              popup.type === "success"
                ? "bg-white/10 border-green-500/20"
                : "bg-white/10 border-red-500/20"
            }`}
          >
            <h3 className={`text-xl font-bold mb-2 ${popup.type === "success" ? "text-green-300" : "text-red-300"}`}>
              {popup.message}
            </h3>
            {popup.type === "error" && (
              <button
                onClick={() => setPopup(null)}
                className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition font-semibold"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Register;
