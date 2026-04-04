import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:2212/api";

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
      const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refreshToken: currentRefreshToken,
      });

      const newAccessToken = refreshResponse?.data?.accessToken;
      const rotatedRefreshToken = refreshResponse?.data?.refreshToken;

      if (!newAccessToken) {
        throw new Error("Refresh token API did not return accessToken");
      }

      localStorage.setItem("accessToken", newAccessToken);
      localStorage.setItem("token", newAccessToken);
      if (rotatedRefreshToken) {
        localStorage.setItem("refreshToken", rotatedRefreshToken);
      }

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
