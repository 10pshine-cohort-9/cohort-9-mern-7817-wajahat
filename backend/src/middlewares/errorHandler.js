const logger = require("../config/logger");

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  const executionTime =
    req.startTime ? Date.now() - req.startTime : null;

  logger.error(
    {
      method: req.method,
      api: req.originalUrl,
      message: err.message,
      result: "FAILED",
      statusCode,
      executionTimeMs: executionTime,

      userId: req.user?.id || null,

      requestBody: req.body,
      requestParams: req.params,
      requestQuery: req.query,

      stack: err.stack,
    },
    "Request Failed"
  );

  return res.status(statusCode).json({
    success: false,
    message: err.message,
  });
};

module.exports = errorHandler;