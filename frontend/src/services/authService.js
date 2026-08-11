import api from "../api/axios";

export const registerUser = async (userData) => {
    const response=await api.post("/auth/register",userData);
    if(response.data?.token){
        localStorage.setItem("token",response.data.token);
    }
    return response;
};

export const loginUser =async (credentials) => {
    const response= await api.post("/auth/login",credentials);
    if(response.data?.token){
        localStorage.setItem("token",response.data.token);
    }
    return response;
};

export const getCurrentUser = () => {
  return api.get("/auth/me");
};

export const logoutuser =async () =>{
    try {
    return await api.post("/auth/logout");
} finally{
    localStorage.removeItem("token");
}
}