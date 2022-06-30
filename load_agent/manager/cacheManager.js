const logger = require("log4js").getLogger("CacheManager");

const { createClient } = require("redis");

const CacheManager = class {
  client = null;

  constructor(host, port) {
    this.client = createClient(host, port);

    this.client.on("error", (err) => logger.info("Redis Client Error", err));

    this.client
      .connect()
      .then((x) => logger.info("Connection to Redis success"));

    this.cleanup();
  }

  register = (socket, data) => {
    logger.info(`Register Redis : ${data.info.nodeName} ${data.cpu.free}`);
    this.client.HSET(`WorkerNode-${socket.id}`, "data", JSON.stringify(data)).then(x=>logger.info(`Registeration completed for ${socket.id} - ${data.info.nodeName}`));
  };

  update = (socket, data) => {
    logger.info(`Update Redis : ${data.info.nodeName} ${data.cpu.free}`);
    this.client.HSET(`WorkerNode-${socket.id}`, "data", JSON.stringify(data));
  };

  delete = (socket) => {
    logger.info(`Delete redis ${socket.id}`);
    this.client.DEL(`WorkerNode-${socket.id}`);
  };

  get = async (socket) => {
    logger.info(`Get redis ${socket.id}`);
    let result = await this.client.HGET(`WorkerNode-${socket.id}`, "data");
    return result;
  };

  list = async () => {
    let list = await this.client.keys("WorkerNode-*");

    let result = [];
    for (let i = 0; i < list.length; i++) {
      let node = list[i];
      let json = await this.client.HGET(node, "data");
      result.push(JSON.parse(json));
    }

    return result;
  };

  cleanup = async () => {
    let list = await this.client.keys("WorkerNode-*");
    for (let i = 0; i < list.length; i++) {
      let node = list[i];
      let json = await this.client.DEL(node);
    }
    logger.info(`Clean up Redis ${list.length} records`);
  };
};

let manager = null;

exports.register = (socket, data) => {
  manager.register(socket, data)
};

exports.update = (socket, data) => {
  manager.update(socket, data)
};

exports.delete = (socket) => {
  manager.delete(socket);
};

exports.get = async (socket) => {
  return await manager.get(socket);
};

exports.list = async () => {
  let result = await manager.list();
  return result;
};

exports.init = async (host, port) => {
  manager = new CacheManager(host, port);
};
