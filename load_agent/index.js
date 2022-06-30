require("dotenv").config();
const express = require("express");
const log4js = require("log4js");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const bodyParser = require('body-parser')
const logger = log4js.getLogger();

const controller = require('./controller/loadAgentController');
const cm = require("./manager/cacheManager");

// Init Log4J
log4js.configure("./config/log4js.json");

// parse application/json
app.use(bodyParser.json())

app.get("/", async (req, res) => {
  let list = await cm.list();
  res.json({"active" : io.engine.clientsCount, list});
});

io.on("connection", (socket) => {
  logger.info(`User connected: ${socket.id}`);
  logger.info(`Total users: ${io.engine.clientsCount}`);

  socket.on("register", (msg) => {
    let response = controller.register(socket, msg);
    socket.emit("ack", response);
  });

  socket.on("update", (msg) => {
    let response = controller.update(socket, msg);
    socket.emit("ack", response);
  });

  socket.on("disconnect", () => {
    let response = controller.disconnect(socket);
    socket.emit("ack", response);
  });
  
});

server.listen(3000, () => {

  logger.info(`Initialize Controller`)
  const REDIS_HOST = process.env.REDIS_HOST;
  const REDIS_PORT = process.env.REDIS_PORT;
  const REDIS_SCOPE = process.env.REDIS_SCOPE;
  controller.init(REDIS_HOST, REDIS_PORT, REDIS_SCOPE);

  logger.info(`Initialize Cache Manager`)
  cm.init(REDIS_HOST, REDIS_PORT);

  logger.info("Load Agent is listening on 3000");
});

