const path = require("path");
const pino = require("pino");

const logDirectory = path.join(__dirname, "../../logs");
const logFilePath = path.join(logDirectory, "app.log");

const logger = pino(
  {
    level: process.env.LOG_LEVEL || "info",

    timestamp: pino.stdTimeFunctions.isoTime,

    formatters: {
      level(label) {
        return {
          level: label.toUpperCase(),
        };
      },
    },

    base: null,
  },
  pino.destination({
    dest: logFilePath,
    mkdir: true,
    sync: false,
  })
);

module.exports = logger;