import axios from "axios";

/**
 * API Base URL Configuration
 * - Reads from VITE_API_BASE_URL environment variable
 * - Fallback is production Railway URL (HTTPS only)
 * - Always ensures HTTPS protocol in production
 */
const getAPIBaseURL = () => {
  const envURL = import.meta.env.VITE_API_BASE_URL;
  
  if (envURL) {
    // Ensure HTTPS protocol
    if (!envURL.startsWith("https://")) {
      console.warn(
        "⚠️  API URL should use HTTPS. Converting to HTTPS:",
        envURL
      );
      return envURL.replace("http://", "https://");
    }
    return envURL;
  }

  // Production fallback - Railway HTTPS URL
  const fallbackURL =
    "https://certificationmanagement-backend-production.up.railway.app/api";
  console.warn(
    "⚠️  VITE_API_BASE_URL not set. Using fallback:",
    fallbackURL
  );
  return fallbackURL;
};

const API_BASE_URL = getAPIBaseURL();
console.log("🌐 API Base URL configured:", API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.request.use(
  (config) => {
    const accessToken =
      localStorage.getItem("accessToken") || localStorage.getItem("token");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;
    const requestPath = originalRequest?.url || "";

    const isAuthEndpoint =
      requestPath.includes("/auth/login") ||
      requestPath.includes("/auth/refresh") ||
      requestPath.includes("/auth/logout");

    if (status !== 401 || originalRequest?._retry || isAuthEndpoint) {
      return Promise.reject(error);
    }

    const currentRefreshToken = localStorage.getItem("refreshToken");

    if (!currentRefreshToken) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Send refreshToken as query parameter (not in request body)
      const refreshResponse = await axios.get(
        `${API_BASE_URL}/auth/refresh?refreshToken=${encodeURIComponent(
          currentRefreshToken
        )}`
      );

      // Backend returns access token as plain string (not JSON object)
      const newAccessToken = refreshResponse?.data;

      if (!newAccessToken || typeof newAccessToken !== "string") {
        throw new Error(
          "Refresh token API did not return valid access token"
        );
      }

      localStorage.setItem("accessToken", newAccessToken);
      localStorage.setItem("token", newAccessToken);

      api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      processQueue(null, newAccessToken);

      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
