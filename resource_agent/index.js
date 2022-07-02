require("./manager").init();

const logger = require("log4js").getLogger("SampleApplication")

/**
 * Sample application to illustrate the High Availability
  */ 
let NODE_NAME=process.env.NODE_NAME;
let NODE_PORT=process.env.NODE_PORT;
let FAIL_LIMIT=process.env.FAIL_LIMIT || 500;

let count = 0;

var http = require('http')
http.createServer(function (req, res) {

  if (count++ > FAIL_LIMIT){
    throw new Error(`Rate Limit exceed ! ${count}`); 
  }

  logger.info(`Handling request ${count}/${FAIL_LIMIT}`);

  let buffer = "";
  buffer += `<html>`;
  buffer += `<body style='background-color: ${stringToColour(NODE_NAME + NODE_PORT)}'>`;
  buffer += `<h2>${NODE_NAME}</h2>`;
  buffer += `<h3>Fail count : ${count}/${FAIL_LIMIT}</h3>`;
  buffer += `<pre>${JSON.stringify(req.headers, true, 2)}</pre>`;
  buffer += `</body>`;
  buffer += `</html> `;
  
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write(buffer);
  res.end();

}).listen(NODE_PORT);

var stringToColour = function(str) {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  var colour = '#';
  for (var i = 0; i < 3; i++) {
    var value = (hash >> (i * 8)) & 0xFF;
    colour += ('00' + value.toString(16)).substr(-2);
  }
  return colour;
}

console.log(`${NODE_NAME} is listening in port ${NODE_PORT}`)
