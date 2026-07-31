const { get } = require("node:http");
const authService = require("../services/auth.service");
const { log } = require("node:console");

const register=async(req,res,next)=>{
    try {
    const result= await authService.registerUser(req.body);
    return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: result,
    });

    } catch (error) {
        next(error);
    }
}
const login = async (req, res, next) => {
  try {
    const result = await authService.loginUser(req.body);

    return res.status(200).json({
      success: true,
      message: "user logged in successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
module.exports={
    register,
    login
}
