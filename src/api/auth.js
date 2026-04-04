import api from "./axios";

/**
 * Login with email and password
 * Backend endpoint: POST /api/auth/login
 * Request body: { "email": "string", "password": "string" }
 * Response: { "accessToken": "string", "refreshToken": "string" }
 */
export const login = async (email, password) => {
  try {
    console.log("🔐 Attempting login with email:", email);
    const response = await api.post("/auth/login", {
      email,
      password,
    });
    console.log("✅ Login successful");
    return response.data;
  } catch (error) {
    const errorDetails = {
      status: error?.response?.status,
      message: error?.message,
      corsIssue: error?.message?.includes("Network Error"),
      serverData: error?.response?.data,
    };
    
    console.error("❌ Login failed:", errorDetails);
    
    if (errorDetails.corsIssue) {
      console.error("🚨 CORS/Network Issue Detected:");
      console.error("  - Backend may not be running on http://localhost:2212");
      console.error("  - Or backend doesn't allow requests from http://localhost:5173");
      console.error("  - Check backend CORS configuration");
    }
    
    throw error;
  }
};

/**
 * Register new user
 * Backend endpoint: POST /api/auth/register
 * Request body: { "username": "string", "email": "string", "password": "string" }
 * Response: { "id": "number", "username": "string", "email": "string" }
 */
export const register = async (username, email, password) => {
  try {
    console.log("📝 Attempting registration with email:", email);
    const response = await api.post("/auth/register", {
      username,
      email,
      password,
    });
    console.log("✅ Registration successful");
    return response.data;
  } catch (error) {
    const errorDetails = {
      status: error?.response?.status,
      message: error?.message,
      corsIssue: error?.message?.includes("Network Error"),
      serverData: error?.response?.data,
    };
    
    console.error("❌ Registration failed:", errorDetails);
    
    if (errorDetails.corsIssue) {
      console.error("🚨 CORS/Network Issue Detected:");
      console.error("  - Backend may not be running on http://localhost:2212");
      console.error("  - Or backend doesn't allow requests from http://localhost:5173");
      console.error("  - Check backend CORS configuration");
    }
    
    throw error;
  }
};

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = async (refreshToken) => {
  try {
    console.log("🔄 Attempting to refresh token");
    const response = await api.post("/auth/refresh", {
      refreshToken,
    });
    console.log("✅ Token refreshed successfully");
    return response.data;
  } catch (error) {
    console.error("❌ Token refresh failed:", error?.response?.data || error.message);
    throw error;
  }
};

/**
 * Logout and invalidate tokens
 */
export const logout = async () => {
  try {
    console.log("🚪 Attempting logout");
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      await api.post("/auth/logout", { refreshToken });
    }
    clearAuthTokens();
    console.log("✅ Logout successful");
  } catch (error) {
    console.error("❌ Logout failed:", error?.response?.data || error.message);
    clearAuthTokens();
  }
};

/**
 * Save authentication tokens to localStorage
 */
export const saveAuthTokens = ({ accessToken, refreshToken }) => {
  if (accessToken) {
    localStorage.setItem("token", accessToken);
    localStorage.setItem("accessToken", accessToken);
    console.log("💾 Access token saved");
  }
  if (refreshToken) {
    localStorage.setItem("refreshToken", refreshToken);
    console.log("💾 Refresh token saved");
  }
};

/**
 * Clear authentication tokens from localStorage
 */
export const clearAuthTokens = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  console.log("🗑️ Tokens cleared");
};

/**
 * Get access token from localStorage
 */
export const getAccessToken = () => {
  return localStorage.getItem("accessToken") || localStorage.getItem("token");
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!(localStorage.getItem("accessToken") || localStorage.getItem("token"));
};
