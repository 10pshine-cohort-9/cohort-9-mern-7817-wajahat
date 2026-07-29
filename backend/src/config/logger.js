const pino = require("pino");
const path = require("path");
const fs = require("fs");

const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}
const logger = pino(
  pino.destination(path.join(logDir, "app.log"))
);

module.exports = logger;