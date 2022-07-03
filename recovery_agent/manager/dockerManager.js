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
      logger.info(
        `Executing "docker container inspect --format '{{.State.Running}} ${instance}`
      );
      let state = await docker.command(
        `container inspect --format '{{.State.Running}}' ${instance}`
      );
      logger.info(`Running Status : ${state.object}`);
      if (state.object) {
        logger.info(`Executing "docker kill ${instance}"`);
        let response = await docker.command(`container kill ${instance}`);
        logger.info(`Response : ${response}`);
      }

      logger.info("Remove orphan instance");
      let response = await docker.command(`container rm ${instance}`);
      logger.info("Response : ", response);
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
  let NODE_PORT = process.env.NODE_PORT;
  // let externalPort = await portfinder.getPortPromise({
  //   port: 8081,
  //   stopPort: 8099,
  // });
  let NODE_NAME = `${process.env.NODE_PREFIX}-${timestamp}-${randomNumber}`;
  let EXTERNAL_HOST = `${process.env.EXTERNAL_HOST}-${timestamp}-${randomNumber}`;
  let LOAD_AGENT_URL = process.env.LOAD_AGENT_URL;
  let IMAGE_NAME = process.env.IMAGE_NAME;
  let DOCKER_NETWORK = process.env.DOCKER_NETWORK;
  let FAIL_LIMIT = process.env.FAIL_LIMIT;

  let ELK_INDEX = process.env.ELK_INDEX;
  let ELK_URL = process.env.ELK_URL;
  let ELK_USERNAME = process.env.ELK_USERNAME;
  let ELK_PASSWORD = process.env.ELK_PASSWORD;
  let ELK_KEY = process.env.ELK_KEY;

  let command = [];
  command.push(`run `); //--rm
  command.push(`-e NODE_PORT=${NODE_PORT}`);
  command.push(`-e NODE_NAME=${NODE_NAME}`);
  command.push(`-e EXTERNAL_HOST=${EXTERNAL_HOST}`);
  command.push(`-e EXTERNAL_PORT=${NODE_PORT}`);
  command.push(`-e FAIL_LIMIT=${FAIL_LIMIT}`);
  command.push(`-e LOAD_AGENT_URL=${LOAD_AGENT_URL}`);

  command.push(`-e ELK_INDEX=${ELK_INDEX}`);
  command.push(`-e ELK_URL=${ELK_URL}`);
  command.push(`-e ELK_USERNAME=${ELK_USERNAME}`);
  command.push(`-e ELK_PASSWORD=${ELK_PASSWORD}`);
  command.push(`-e ELK_KEY=${ELK_KEY}`);
  
  command.push(`--name ${NODE_NAME}`);
  command.push(`--network ${DOCKER_NETWORK}`)
  // command.push(`-p ${externalPort}:${NODE_PORT}`);
  command.push(`-d ${IMAGE_NAME}`);

  let commandString = command.join(" ");
  logger.info(`Executing docker ${commandString}`);

  docker.command(commandString).then(function (data) {
    logger.info(`Response : `, data);
  });
};
