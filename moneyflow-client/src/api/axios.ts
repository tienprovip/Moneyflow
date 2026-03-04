import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "@/utils/token";
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api",
});

// REQUEST INTERCEPTOR
axiosInstance.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// RESPONSE INTERCEPTOR (AUTO REFRESH)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();

        const res = await axios.post(
          "http://localhost:5000/api/auth/refresh-token",
          {
            refreshToken,
          },
        );

        const { accessToken, refreshToken: newRefresh } = res.data;
        setTokens(accessToken, newRefresh);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (error) {
        clearTokens();
        window.location.href = "/auth";
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
