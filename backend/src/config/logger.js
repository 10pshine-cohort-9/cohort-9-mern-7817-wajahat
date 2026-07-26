const pino = require("pino");

const logger = pino(
  pino.destination("../../logs/app.log")
);

module.exports = logger;