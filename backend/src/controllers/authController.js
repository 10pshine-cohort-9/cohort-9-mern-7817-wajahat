// const authService = require("../services/auth.service");

// const register=async(req,res,next)=>{
//     try {
//     const result= await authService.registerUser(req.body);
//     return res.status(201).json({
//             success: true,
//             message: "User registered successfully",
//             data: result,
//     });

//     } catch (error) {
//         next(error);
//     }
// }
// const login = async (req, res, next) => {
//   try {
//     const result = await authService.loginUser(req.body);
//     res.cookie("token", result.token, {
//       httpOnly: true,
//       secure: false,
//       sameSite: "lax",
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//     });
//     return res.status(200).json({
//       success: true,
//       message: "user logged in successfully",
//       data: {
//         user: result.user,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// const getMe=async(req,res,next)=>{
//   try {
//     const result= await authService.getMe(req.user.id);
//     return res.status(200).json({
//       success:true,
//       message:"profile fetched",
//       data:result,
//     });
//   } catch (error) {
//     next(error)
//   }
// }
// const logout = async (req, res, next) => {
//   try {
//     const result = await authService.logoutUser(req.user);

//     return res.status(200).json(result);
//   } catch (error) {
//     next(error);
//   }
// };
// module.exports={
//     register,
//     login,getMe,logout
// }




import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { getCurrentUser, logoutUser } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreUser = async () => {
      try {
        const response = await getCurrentUser();

        const currentUser = response.data?.data?.user;

        if (currentUser) {
          setUser(currentUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to restore user:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreUser();
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

 const logout = async (req, res, next) => {
  try {
    const result = await authService.logoutUser(req.user);

    res.clearCookie("token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};