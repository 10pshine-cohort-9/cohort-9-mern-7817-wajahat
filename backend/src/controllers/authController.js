const { get } = require("node:http");
const authService = require("../services/auth.service");

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

module.exports={
    register
    
}
