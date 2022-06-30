require("./manager").init();

/**
 * Sample application to illustrate the High Availability
  */ 
let NODE_NAME=process.env.NODE_NAME;
let NODE_PORT=process.env.NODE_PORT;

var http = require('http')
http.createServer(function (req, res) {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.write(`${NODE_NAME}` + '\n' + JSON.stringify(req.headers, true, 2));
  res.end();
}).listen(NODE_PORT);

console.log(`${NODE_NAME} is listening in port ${NODE_PORT}`)
