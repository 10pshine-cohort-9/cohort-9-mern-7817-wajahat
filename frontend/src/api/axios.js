import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3005/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  /**
   * @param {import('axios').InternalAxiosRequestConfig} config
   * @returns {import('axios').InternalAxiosRequestConfig}
   */
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  /**
   * @param {Error} error
   * @returns {Promise<never>}
   */
  (error) => Promise.reject(error)
);

export default api;