import api from "../api/axios";

export const registerUser = (userData) => {
  return api.post("/auth/register", userData);
};

export const loginUser = (credentials) => {
  return api.post("/auth/login", credentials);
};

export const getCurrentUser = () => {
  return api.get("/auth/me");
};

export const logoutuser =() =>{
    return api.post("/auth/logout");
}