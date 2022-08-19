const { io } = require("socket.io-client");
var logger = require("log4js").getLogger("NotificationManager");

let rm = null;
let event = null;

exports.init = (resourceManager, registrationDelay, loadAgentUrl) => {
  rm = resourceManager;

  const socket = io(loadAgentUrl);
  socket.on("connect", () => {
    logger.info(`Connected with ${socket.id}`);

    if (event != null) {
      logger.info(`Reconnect, skip registration`);
      return;
    }

    event = setTimeout(() => {
      register(socket);
    }, registrationDelay);
  });

  socket.on("ack", (message) => {
    let timeout = message.ttr;
    // logger.info(`Repost Status after ${timeout}ms`);

    event = setTimeout(() => {
      update(socket);
    }, timeout);
  });
};

const register = (socket) => {
  let promise = rm.getStatus();
  promise.then((result) => {
    logger.info(`Sending Register ${result.cpu.free}`);
    socket.emit("register", result);
  });
};

const update = (socket) => {
  let promise = rm.getStatus();
  promise.then((result) => {
    // logger.info(`Sending Update ${result.cpu.free}`);
    socket.emit("update", result);
  });
};
