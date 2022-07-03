const NRP = require("node-redis-pubsub");
const logger = require("log4js").getLogger("NotificationManager");
var nrp = null;
exports.init = (host, port, scope) => {
  var config = {host, port, scope}
  nrp = new NRP(config);

  logger.info(`Notification Manager initialized`)
};


exports.notify = (socket, info) => {
  logger.info(`Notify recovery request to ${info.info.nodeName}`)
  nrp.emit('recovery', { info });  
}