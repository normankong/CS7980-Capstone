require("dotenv").config();
const moment = require("moment");
const logger = require("log4js").getLogger("DockerManager");
const { Docker } = require("docker-cli-js");
var portfinder = require("portfinder");

// default options
const options = {
  machineName: undefined, // uses local docker
  currentWorkingDirectory: undefined, // uses current working directory
  echo: true, // echo command output to stdout/stderr
  env: undefined,
  stdin: undefined,
};

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}

exports.listing = async () => {
  var docker = new Docker(options);
  let data = await docker.command("image ls");
  logger.info(`Listing Command `, data);
  return data;
};

exports.recycle = (instance) => {
  var docker = new Docker(options);

  logger.info(`Recycle Instance ${instance}`);

  const cleanup = async (instance) => {
    try {
      logger.debug(
        `Executing "docker container inspect --format '{{.State.Running}} ${instance}`
      );
      let state = await docker.command(
        `container inspect --format '{{.State.Running}}' ${instance}`
      );
      logger.debug(`Running Status : ${state.object}`);
      if (state.object) {
        logger.debug(`Executing "docker kill ${instance}"`);
        let response = await docker.command(`container kill ${instance}`);
        logger.debug(`Response : ${response}`);
      }

      logger.debug("Remove orphan instance");
      let response = await docker.command(`container rm ${instance}`);
      logger.debug("Response : ", response);
    } catch (exception) {
      logger.error(`Unable to cleanup ${instance}`, exception);
    }
  };

  cleanup(instance);
};

exports.provision = async () => {
  var docker = new Docker(options);

  let timestamp = moment().format("YYYYMMDD_hhmmss");
  let randomNumber = getRandomIntInclusive(10000000, 99999999);
  let DOCKER_NODE_PORT = process.env.DOCKER_NODE_PORT;
  // let externalPort = await portfinder.getPortPromise({
  //   port: 8081,
  //   stopPort: 8099,
  // });
  let DOCKER_NODE_NAME = `${process.env.DOCKER_NODE_PREFIX}-${timestamp}-${randomNumber}`;
  let DOCKER_EXTERNAL_HOST = `${process.env.DOCKER_EXTERNAL_HOST}-${timestamp}-${randomNumber}`;
  let DOCKER_LOAD_AGENT_URL = process.env.DOCKER_LOAD_AGENT_URL;
  let DOCKER_IMAGE_NAME = process.env.DOCKER_IMAGE_NAME;
  let DOCKER_NETWORK = process.env.DOCKER_NETWORK;
  let DOCKER_FAIL_LIMIT = process.env.DOCKER_FAIL_LIMIT;
  let DOCKER_EXHAUSTED_LIMIT = process.env.DOCKER_EXHAUSTED_LIMIT;

  let DOCKER_ELK_INDEX = process.env.DOCKER_ELK_INDEX;
  let DOCKER_ELK_URL = process.env.DOCKER_ELK_URL;
  let DOCKER_ELK_USERNAME = process.env.DOCKER_ELK_USERNAME;
  let DOCKER_ELK_PASSWORD = process.env.DOCKER_ELK_PASSWORD;
  let DOCKER_ELK_KEY = process.env.DOCKER_ELK_KEY;

  let DOCKER_REDIS_HOST=process.env.DOCKER_REDIS_HOST;
  let DOCKER_REDIS_PORT=process.env.DOCKER_REDIS_PORT;

  let command = [];
  command.push(`run `); //--rm
  command.push(`-e NODE_PORT=${DOCKER_NODE_PORT}`);
  command.push(`-e NODE_NAME=${DOCKER_NODE_NAME}`);
  command.push(`-e EXTERNAL_HOST=${DOCKER_EXTERNAL_HOST}`);
  command.push(`-e EXTERNAL_PORT=${DOCKER_NODE_PORT}`);
  command.push(`-e FAIL_LIMIT=${DOCKER_FAIL_LIMIT}`);
  command.push(`-e EXHAUSTED_LIMIT=${DOCKER_EXHAUSTED_LIMIT}`);
  command.push(`-e LOAD_AGENT_URL=${DOCKER_LOAD_AGENT_URL}`);

  command.push(`-e ELK_INDEX=${DOCKER_ELK_INDEX}`);
  command.push(`-e ELK_URL=${DOCKER_ELK_URL}`);
  command.push(`-e ELK_USERNAME=${DOCKER_ELK_USERNAME}`);
  command.push(`-e ELK_PASSWORD=${DOCKER_ELK_PASSWORD}`);
  command.push(`-e ELK_KEY=${DOCKER_ELK_KEY}`);
  
  command.push(`-e REDIS_HOST=${DOCKER_REDIS_HOST}`);
  command.push(`-e REDIS_PORT=${DOCKER_REDIS_PORT}`);
  
  command.push(`--name ${DOCKER_NODE_NAME}`);
  command.push(`--network ${DOCKER_NETWORK}`)
  // command.push(`-p ${externalPort}:${NODE_PORT}`);
  command.push(`-d ${DOCKER_IMAGE_NAME}`);

  let commandString = command.join(" ");
  // logger.info(`Executing docker ${commandString}`);
  logger.info(`Executing docker to provision : ${DOCKER_IMAGE_NAME} : ${DOCKER_NODE_NAME}`)

  docker.command(commandString).then(function (data) {
    // logger.info(`Response : `, data);
  });
};
