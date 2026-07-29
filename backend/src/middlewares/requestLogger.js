const pinoHttp = require("pino-http");
const logger = require("../config/logger");

module.exports = pinoHttp({
  logger,
  redact: {
    paths: ["req.headers.authorization", "req.headers.cookie"],
    censor: "[REDACTED]",
  },
});