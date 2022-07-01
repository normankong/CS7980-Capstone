var http = require('http');

const log4js = require("log4js");
const router = require("./manager/routingManager.js");

// Init Log4J
log4js.configure("./config/log4js.json");

// Initial Router
const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = process.env.REDIS_PORT;
router.init(REDIS_HOST, REDIS_PORT);

var serverCallback = function(req, res) {
  router.handle(req, res);
};

var server = http.createServer(serverCallback);

server.listen(8080);

