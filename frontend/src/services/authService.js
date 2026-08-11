import api from "../api/axios";

/**
 * @param {Object} userData
 * @returns {Promise<Object>}
 */
export const registerUser = async (userData) => {
  const response = await api.post("/auth/register", userData);
  const token = response.data?.data?.token || response.data?.token;

  if (token) {
    localStorage.setItem("token", token);
  }
  return response;
};

/**
 * @param {Object} credentials
 * @returns {Promise<Object>}
 */
export const loginUser = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  const token = response.data?.data?.token || response.data?.token;

  if (token) {
    localStorage.setItem("token", token);
  }
  return response;
};

/**
 * @returns {Promise<Object>}
 */
export const getCurrentUser = () => {
  return api.get("/auth/me");
};

/**
 * @returns {Promise<Object>}
 */
export const logoutUser = async () => {
  try {
    return await api.post("/auth/logout");
  } finally {
    localStorage.removeItem("token");
  }
};