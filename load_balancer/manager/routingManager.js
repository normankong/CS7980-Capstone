const log4js = require('log4js');
const elk = require("./elkLogger.js");
const logger = log4js.getLogger();

const proxy = require("http-proxy");

const cm = require("./cacheManager");

// Initialize ELK Logger
elk.init();

const selectServer = async function (req, res) {
  let servers = await cm.list();

  let proxyInfo = performRARA(servers, req);
  if (proxyInfo == null) return null;

  const host = proxyInfo.info.externalHost;
  const port = proxyInfo.info.externalPort;

  const handler = new proxy.createProxyServer({
    target: { host, port },
    ws: true,
    xfwd: true,
  });

  logger.info(`Routing to ${proxyInfo.info.nodeName}`);
  return handler;
};

const performRARA = (servers, req) => {
  if (servers.length == 0) return null;
  if (servers.length == 1) return servers[0];

  // let index = Math.floor(Math.random() * servers.length | 0);
  // logger.info(`Routing request to ${index}`)
  // return servers[index];

  let qosclass = parseInt(req.headers.qosclass, 10) || 20;
  // logger.info(`Incoming request require CPU : ${qosclass}`);

  let bestFit = servers.find(
    (a) => a != null && a.cpu.free > qosclass + 10 && a.cpu.free < qosclass + 20
  );
  if (bestFit != null) {
    logger.info(`There is best fit node ${bestFit.cpu.free}`);
    return bestFit;
  }

  let list = servers.filter((a) => a!= null && a.cpu.free > qosclass);
  if (list.length == 0) {
    logger.info(`There is no servers that have enough ${qosclass} cpu.`);
    return null;
  }

  list = servers.filter((a) => a!=null && a.cpu.free > qosclass);

  // Sort by CPU resource decendingly
  list.sort((a, b) => {
    return b.cpu.free - a.cpu.free;
  });

  // servers.forEach(x => console.log(x.cpu.free));
  return list[0];
};

exports.init = (host, port) => {
  cm.init(host, port);
};

/**
 * Handle HTTP Connection
 */
exports.handleHTTP = async (req, res) => {

  if (req.url == "/status") {
    let servers = await cm.list();
    res.writeHead(200, { 'Content-Type': 'text/json' });
    res.end(JSON.stringify(servers, null, 2));
    return;
  }


  var handler = await selectServer(req);
  if (handler == null) {
    logger.error(`Load Balancer : 502 Error : Outage due to not enough cpu to fullfill the requirement.`);
    elk.log(`Load Balancer : 502 Error : Outage due to not enough cpu to fullfill the requirement.`);
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end("Outage due to not enough cpu to fullfill the requirement.");
    return;
  }

  logger.info(`Connecting to ${handler.options.target.host}:${handler.options.target.port} ${req.method} ${req.url}`);

  // Handle the request
  handler.web(req, res);

  handler.on("error", function (err) {
    logger.error(`Something happen ${err}`);
    elk.log(`Load Balancer : 503 Error : ${err}`);
    res.writeHead(503, { 'Content-Type': 'text/plain' });
    res.end(`Outage due to connection lost : ${err}`);
  });

};

/**
 * Handle Web Socket Connection
 */
exports.handleSocket = async (req, socket, head) => {
  var handler = await selectServer(req);
  if (handler == null) {
    elk.log(`Load Balancer : 502-S Error : Outage due to not enough cpu to fullfill the requirement.`);
    socket.end();
    return;
  }

  logger.info(`Open Socket to ${handler.options.target.host}:${handler.options.target.port}`);

  handler.on('error', function(err, req, socket) {
    logger.error(`Something happen ${err}`);
    elk.log(`Load Balancer : 503-S Error : ${err}`);
    socket.end();
  });
  
  // Handle the request
  handler.ws(req, socket, head);
};