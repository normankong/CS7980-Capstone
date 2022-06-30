require('dotenv').config()
const logger = require("log4js").getLogger("CacheManager");

const { createClient } = require("redis");

const CacheManager = class {

    client = null;

    constructor(url) {

      this.client = createClient({url});

      this.client.on("error", (err) => logger.info("Redis Client Error", err));
    
      this.client.connect().then(x => logger.info("Connection to Redis success"));
    }

    update = (socket, data) => {
        logger.info(`Update Redis : ${data.info.nodeName} ${data.cpu.free}`);
        this.client.HSET(`WorkerNode-${socket.id}`, "data", JSON.stringify(data));
    }

    delete = (socket) => {
        logger.info(`Cleanup redis ${socket.id}`);
        this.client.DEL(`WorkerNode-${socket.id}`);
    }
    
    list = async () => {
        let list = await this.client.keys("WorkerNode-*");

        let result = [];
        for (let i = 0; i < list.length; i++){
              let node = list[i];
              let json = await this.client.HGET(node, "data");
              result.push(JSON.parse(json));
        };
        
        return result;
    }

    cleanup = async () => {
        let list = await this.client.keys("WorkerNode-*");
        for (let i = 0; i < list.length; i++){
            let node = list[i];
            let json = await this.client.DEL(node);
        };
        logger.info(`Clean up Redis ${list.length} records`)
    }

};

let url = process.env.REDIS_CONNECTION_URL;
let instance = new CacheManager(url);

exports.update = (socket, data) => {
    instance.update(socket, data);

} 

exports.disconnect = (socket) => {
    instance.delete(socket.id);
} 

exports.list = async() => {
    let result = await instance.list();
    return result;
} 

exports.cleanup = async() => {
    instance.cleanup();
}