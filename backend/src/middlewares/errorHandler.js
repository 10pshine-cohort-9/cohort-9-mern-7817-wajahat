const logger = require("../config/logger");
module.exports = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  if (statusCode === 500) {
    logger.error(err);
  }

  const responseMessage =
  statusCode === 500 ? "Internal Server Error" : err.message;
  res.status(statusCode).json({
    success: false,
    message: responseMessage,
  });
};