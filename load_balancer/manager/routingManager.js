const logger = require("log4js").getLogger();
const proxy = require("http-proxy");

const cm = require("./cacheManager");

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

  let qosclass = parseInt(req.headers.qosclass, 10) || 20;
  logger.info(`Incoming request require CPU : ${qosclass}`);

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

exports.handle = async (req, res) => {
  var handler = await selectServer(req);
  if (handler == null) {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end("Outage due to not enough cpu to fullfill the requirement.");
    return;
  }

  /**
   * Handle the request
   */
  handler.web(req, res);

  handler.on("error", function (err) {
    logger.error(`Something happen ${err}`);
    res.writeHead(503, { 'Content-Type': 'text/plain' });
    res.end(`Outage due to connection lost : ${err}`);
  });
};
