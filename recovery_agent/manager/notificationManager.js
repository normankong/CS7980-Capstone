const NRP = require("node-redis-pubsub");
const logger = require("log4js").getLogger("NotificationManager");
const elk = require("./elkLogger")

exports.init = (host, port, scope, dm) => {
  var config = {host, port, scope}

  var nrp = new NRP(config);

  elk.init();

  nrp.on("recovery", async (data) => {
    logger.info(`Incoming recovery : `,data);
    // dm.listing();

    let nodeInfo = data.info;

    let nodeName = nodeInfo.info.nodeName;
    let hostname = nodeInfo.info.hostname;

    await elk.log(`Recovery Agent : Recovering ${nodeName} with hostname ${hostname} started` )

    logger.info(`Cleanup ${nodeName} with hostname ${hostname}`)
    await dm.recycle(hostname);

    logger.info(`Re-provision a new instance`)
    await dm.provision();

    await elk.log(`Recovery Agent : Recovering ${nodeName} with hostname ${hostname} completed` )

  });

  logger.info(`Notification Manager initialized`)
};
