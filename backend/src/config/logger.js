
const pino = require("pino");

const logger = pino(
  {
    level: process.env.LOG_LEVEL || "info",
  },
  pino.destination({
    dest: "E:/PROJECTS/cohort-9-mern-7817-wajahat/backend/logs/app.log",
    sync: true,
  })
);

module.exports = logger;