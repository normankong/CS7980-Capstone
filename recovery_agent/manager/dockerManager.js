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
  let nodePort = process.env.NODE_PORT;
  let nodeName = `${process.env.NODE_PREFIX}-${timestamp}`;
  let externalHost = process.env.EXTERNAL_HOST;
  let externalPort = await portfinder.getPortPromise({
    port: 8081,
    stopPort: 8099,
  });
  let loadAgentUrl = process.env.LOAD_AGENT_URL;
  let imageName = process.env.IMAGE_NAME;

  let command = [];
  command.push(`run `); //--rm
  command.push(`-e NODE_PORT=${nodePort}`);
  command.push(`-e NODE_NAME=${nodeName}`);
  command.push(`-e EXTERNAL_HOST=${externalHost}`);
  command.push(`-e EXTERNAL_PORT=${externalPort}`);
  command.push(`-e LOAD_AGENT_URL=${loadAgentUrl}`);
  command.push(`--name ${nodeName}`);
  command.push(`-p ${externalPort}:${nodePort}`);
  command.push(`-d ${imageName}`);

  let commandString = command.join(" ");
  logger.info(`Executing docker ${commandString}`);

  docker.command(commandString).then(function (data) {
    logger.info(`Response : `, data);
  });
};

// // docker run \
// // -e NODE_PORT=8080 \
// // -e NODE_NAME=NodeAgentC \
// // -e EXTERNAL_HOST=host.docker.internal \
// // -e EXTERNAL_PORT=8083 \
// // -e LOAD_AGENT_URL='http://host.docker.internal:3000' \
// // --rm --name NodeAgentC \
// // -p 8083:8080 -d resource_agent