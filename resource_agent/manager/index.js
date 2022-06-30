const log4js = require("log4js");
const rm = require("./resourceManager");
const nm = require("./notificationManager");

const init = (
  log4jConfig = "./config/log4js.json",
  loadAgentUrl,
  registrationDelay = 1000,
  nodeName,
  externalHost,
  externalPort
) => {
  /**
   * Setup Log4JS Config
   */
  log4js.configure(log4jConfig);

  /**
   * Setup Resource Manager
   */
  rm.init(nodeName, externalHost, externalPort);

  /**
   * Setup Notification Event
   */
  nm.init(rm, registrationDelay, loadAgentUrl);
};

/**
 * Export Interface
 */
exports.init = () => {
  let LOG4J_CONFIG = process.env.LOG4J_CONFIG; // Optional Parameter
  let NODE_NAME = process.env.NODE_NAME;
  let EXTERNAL_HOST = process.env.EXTERNAL_HOST;
  let EXTERNAL_PORT = process.env.EXTERNAL_PORT;
  let LOAD_AGENT_URL = process.env.LOAD_AGENT_URL;
  let REGISTRATION_DELAY = process.env.REGISTRATION_DELAY; // Optional Parameter
  init(
    LOG4J_CONFIG,
    LOAD_AGENT_URL,
    REGISTRATION_DELAY,
    NODE_NAME,
    EXTERNAL_HOST,
    EXTERNAL_PORT
  );
};
