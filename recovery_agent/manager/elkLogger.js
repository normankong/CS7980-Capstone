require("dotenv").config();
const fs = require("fs");
const { Client } = require("@elastic/elasticsearch");

let logger = null;

const ELKLogger = class {
  client = null;
  index = null;

  constructor(index, username, password, node, keyFile) {
    this.client = new Client({
      node,
      auth: {
        username,
        password,
      },
      tls: {
        ca: fs.readFileSync(keyFile),
        rejectUnauthorized: false,
      },
    });

    this.index = index;
  }

  log = async (message) => {
    this.client.index({
      index: this.index,
      body: { "@timestamp": new Date(), message },
    });
  };
};

exports.init = (
  index = process.env.ELK_INDEX,
  username = process.env.ELK_USERNAME,
  password = process.env.ELK_PASSWORD,
  elkUrl = process.env.ELK_URL,
  keyFile = process.env.ELK_KEY
) => {
  logger = new ELKLogger(index, username, password, elkUrl, keyFile);
};

exports.log = (message) => {
  logger.log(message);
};
