const cm = require("../manager/cacheManager");
const nm = require("../manager/notificationManager");
const elk = require("../manager/elkLogger");

const logger = require("log4js").getLogger("LoadAgentController");

/**
 * Initialize ELK Logger
 */
elk.init();


/**
 * Register Node Status
 */
exports.register = (socket, data) => {
  logger.info(
    `Register : ${socket.id}, [${data.info.nodeName} : ${data.cpu.free}%]`
  );
  cm.register(socket, data);

  elk.log(`Load Agent : Register new service, adding ${data.info.nodeName} into inventory`)

  return { status: 0001, ttr: 1000 };
};

/**
 * Update Node Status
 */
exports.update = (socket, data) => {
  logger.info(
    `Update : ${socket.id}, [${data.info.nodeName} : ${data.cpu.free}%]`
  );
  cm.update(socket, data);
  return { status: 0001, ttr: 1000 };
};

exports.init = (host, port, scope) => {
  nm.init(host, port, scope);
};

/**
 * Disconnect Node Status
 */
exports.disconnect = async (socket) => {
  logger.info(`Disconnect ${socket.id}`);

  elk.log(`Load Agent : Service terminated, removing ${socket.id} from inventory`)

  let info = await cm.get(socket);
  if (info == null) {
    logger.info(`Record not found in database, skip cleanup`)
    return;
  }

  let json = JSON.parse(info);
  logger.info(`Notifiy recover agent : ${json.info.hostname}`);
  nm.notify(socket, json);

  logger.info(`Cleaning Cache ${socket.id}`);
  cm.delete(socket);
};
