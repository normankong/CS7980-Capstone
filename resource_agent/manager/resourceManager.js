const  osu = require("node-os-utils");
const cpu = osu.cpu;
const os = osu.os;
const mem = osu.mem;
const netstat = osu.netstat;
const proc = osu.proc;
let NODE_NAME;
let EXTERNAL_HOST;
let EXTERNAL_PORT;

exports.init = (nodeName, externalHost, externalPort) => {
  NODE_NAME = nodeName;
  EXTERNAL_HOST = externalHost;
  EXTERNAL_PORT = parseInt(externalPort, 10);
}

exports.getStatus = () => {
  return new Promise((resolve) => {
    Promise.all([
      cpu.usage(),
      cpu.free(),
      mem.info(),
      netstat.stats(),
      proc.totalProcesses(),
      os.hostname(),
      os.uptime(),
    ]).then((values) => {
      let response = {
        info: {
          nodeName : NODE_NAME,
          hostname: os.hostname(),
          uptime: os.uptime(),
          externalHost : EXTERNAL_HOST,
          externalPort : EXTERNAL_PORT,
        },
        cpu: {
          count: cpu.count(),
          usage: values[0],
          free: values[1],
          average: cpu.average(),
          loadavg: cpu.loadavg(),
          loadavgTime: cpu.loadavgTime(),
        },
        memory: values[2],
        network: values[3],
        process: {
          total: values[4],
        }
      };

      resolve(response);
    });
  });
};
