// const pino = require("pino");
// const path = require("path");
// const fs = require("fs");

// const logDir = path.join(process.cwd(), "logs");
// if (!fs.existsSync(logDir)) {
//   fs.mkdirSync(logDir, { recursive: true });
// }

// const logger = pino(
//   pino.destination({
//     dest: path.join(logDir, "app.log"),
//     sync: true, 
//   })
// );

// module.exports = logger;

// src/config/logger.js
const pino = require("pino");

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
}, pino.destination({ sync: true })); // <-- sync: true keeps process event loop open

module.exports = logger;