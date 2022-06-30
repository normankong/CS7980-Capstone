require("dotenv").config();
const express = require("express");
const log4js = require("log4js");
const app = express();
const http = require("http");
const server = http.createServer(app);
const nm = require("./manager/notificationManager");
const dm = require("./manager/dockerManager");

// Init Log4J
log4js.configure("./config/log4js.json");
var logger = log4js.getLogger();

// Initialize Node Manager
const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = process.env.REDIS_PORT;
const REDIS_SCOPE = process.env.REDIS_SCOPE;
nm.init(REDIS_HOST, REDIS_PORT, REDIS_SCOPE, dm);

app.get("/", async (req, res) => {
  res.json({ status: "ok" });
});

app.get("/docker", async (req, res) => {
  let result = await dm.listing();
  res.json({ status: "ok", result });
});

server.listen(3001, () => {
  logger.info("Recovery Agent is running on 3001");
});
