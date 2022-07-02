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
  let nodePort = process.env.NODE_PORT;
  let nodeName = `${process.env.NODE_PREFIX}-${timestamp}-${randomNumber}`;
  let externalHost = `${process.env.EXTERNAL_HOST}-${timestamp}-${randomNumber}`;
  let externalPort = await portfinder.getPortPromise({
    port: 8081,
    stopPort: 8099,
  });
  let loadAgentUrl = process.env.LOAD_AGENT_URL;
  let imageName = process.env.IMAGE_NAME;
  let dockerNetwork = process.env.DOCKER_NETWORK;
  let failLimit = process.env.FAIL_LIMIT;

  let command = [];
  command.push(`run `); //--rm
  command.push(`-e NODE_PORT=${nodePort}`);
  command.push(`-e NODE_NAME=${nodeName}`);
  command.push(`-e EXTERNAL_HOST=${externalHost}`);
  command.push(`-e EXTERNAL_PORT=${nodePort}`);
  command.push(`-e FAIL_LIMIT=${failLimit}`);
  command.push(`-e LOAD_AGENT_URL=${loadAgentUrl}`);
  command.push(`--name ${nodeName}`);
  command.push(`--network ${dockerNetwork}`)
  command.push(`-p ${externalPort}:${nodePort}`);
  command.push(`-d ${imageName}`);

  let commandString = command.join(" ");
  logger.info(`Executing docker ${commandString}`);

  docker.command(commandString).then(function (data) {
    logger.info(`Response : `, data);
  });
};
