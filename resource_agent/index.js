require("./manager").init();

const logger = require("log4js").getLogger("SampleApplication")
const elk = require("./manager/elkLogger");
const moment = require('moment')

/**
 * Initialize ELK Logger
 */
elk.init();

/**
 * Sample application to illustrate the High Availability
  */ 
let NODE_NAME=process.env.NODE_NAME;
let NODE_PORT=process.env.NODE_PORT;
let FAIL_LIMIT=process.env.FAIL_LIMIT || 500;
let EXHAUSTED_LIMIT = process.env.EXHAUSTED_LIMIT || 60;

let count = 0;
let startTime = moment()
var http = require('http');
let app = http.createServer(async function (req, res) {

  if (++count > FAIL_LIMIT){
    await elk.log(`Resource Agent : ${NODE_NAME} - Rate Limit exceed, stopping instance : ${count}/${FAIL_LIMIT}`)
    throw new Error(`Rate Limit exceed ! ${count}`); 
  }

  let endTime = moment();
  logger.info(`Handling request ${count}/${FAIL_LIMIT}`);

  let buffer = "";
  buffer += `<html>`;
  buffer += `<body style='background-color: ${stringToColour(NODE_NAME + NODE_PORT)}'>`;
  buffer += `<h2>${NODE_NAME}</h2>`;
  buffer += `<h3>Fail count : ${count}/${FAIL_LIMIT}</h3>`;
  buffer += `<h3>Time Limit : ${endTime.diff(startTime, "s")}/${EXHAUSTED_LIMIT}</h3>`;
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


var io = require('socket.io')(app);
var clients = [];
io.on('connection', (socket) => {
  console.log('a user connected');
  clients.push(socket);

  setInterval(()=>{
    for (var i=0; i<clients.length; i++) {
      clients[i].write(`Handling request ${count}/${FAIL_LIMIT}`);
    }
  }, 1000)

  // Listen for data coming from clients.
  socket.on('message', function(message) {
    console.log(message)
    // Broadcast the message to all connected clients.
    for (var i=0; i<clients.length; i++) {
      clients[i].write(`Reply from ${NODE_PORT} ${message}`);
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    clients.splice(clients.indexOf(socket), 1);
  });
});



// Implement the Time Killer Switch
let timeKillerSwitch = () => {
  let startTime = moment()
  elk.log(`Resource Agent : ${NODE_NAME} - Start at ${startTime.format("YYYY-MM-DD HH:mm:ss")} and Killed at ${EXHAUSTED_LIMIT} seconds`)
  
  setInterval( async ()=>{
    let endTime = moment();
    if (endTime.diff(startTime, "s") >= EXHAUSTED_LIMIT){
      await elk.log(`Resource Agent : ${NODE_NAME} - Time Limit exceed, stopping instance ${NODE_NAME} : ${startTime.format("YYYY-MM-DD HH:mm:ss")} --> ${endTime.format("YYYY-MM-DD HH:mm:ss")}`)
      throw new Error(`Time Limit exceed ! ${endTime.format("YYYY-MM-DD HH:mm:ss")}`); 
    }
  }, 1000);
}

timeKillerSwitch();