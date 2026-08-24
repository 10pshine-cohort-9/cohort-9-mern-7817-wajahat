const authService = require("../services/auth.service");

const register=async(req,res,next)=>{
    try {
    const { user, token } = await authService.register(req.body);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // adjust cookie expiry as needed
    });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
}
const login = async (req, res, next) => {
  try {
    const result = await authService.loginUser(req.body);
    res.cookie("token", result.token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({
      success: true,
      message: "user logged in successfully",
      data: {
        user: result.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getMe=async(req,res,next)=>{
  try {
    const result= await authService.getMe(req.user.id);
    return res.status(200).json({
      success:true,
      message:"profile fetched",
      data:result,
    });
  } catch (error) {
    next(error)
  }
}
const logout = async (req, res, next) => {
  try {
    const result = await authService.logoutUser(req.user);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
module.exports={
    register,
    login,getMe,logout
}