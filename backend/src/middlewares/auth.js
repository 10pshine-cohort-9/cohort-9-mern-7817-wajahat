const { verifyToken } = require("../utils/jwt");
const authenticate = (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      const error = new Error("Authentication token missing");
      error.statusCode = 401;
      throw error;
    }
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    error.statusCode = error.statusCode || 401;
    next(error);
  }
};

module.exports = authenticate;