require("./manager").init();

const logger = require("log4js").getLogger("SampleApplication")
const elk = require("./manager/elkLogger");

const { createAdapter } = require("@socket.io/redis-adapter");
const { createClient } = require("redis");

/**
 * Initialize ELK Logger
 */
elk.init();

// /**
//  * Sample application to illustrate the High Availability
//   */ 
let NODE_NAME=process.env.NODE_NAME;
let NODE_PORT=process.env.NODE_PORT;
let FAIL_LIMIT=process.env.FAIL_LIMIT || 500;
let REDIS_HOST=process.env.REDIS_HOST;
let REDIS_PORT=process.env.REDIS_PORT;

let count = 0;

var http = require('http')
let app = http.createServer(async function (req, res) {

  ++count;
  if (req.url == "/api/terminate"){
    await elk.log(`Resource Agent : Terminate node on request ${NODE_NAME} : ${count}/${FAIL_LIMIT}`)
    throw new Error(`Terminate node on request ! ${count}/${FAIL_LIMIT}`)
  }

  if (req.url == "/api/health"){
    res.writeHead(200, { 'Content-Type': 'text/json' });
    res.write(JSON.stringify({ status: "OK", count, NODE_NAME, NODE_PORT, FAIL_LIMIT }, null, 2));
    res.end();
    return;
  }

  logger.info(`Handling request ${count}/${FAIL_LIMIT}`);

  let buffer = "";
  buffer += `<html>`;
  buffer += `<body style='background-color: ${stringToColour(NODE_NAME + NODE_PORT)}'>`;
  buffer += `<h2>${NODE_NAME} : ${NODE_PORT}</h2>`;
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

var io = require('socket.io')(app);
let url = `redis://${REDIS_HOST}:${REDIS_PORT}`;
console.log(`Connecting redis server at ${url}`);
// const pubClient = createClient({ url: "redis://localhost:6379" });
const pubClient = createClient({ url });
const subClient = pubClient.duplicate();
Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
  io.adapter(createAdapter(pubClient, subClient));
});


// var clients = [];
io.on('connection', (socket) => {
  console.log('a user connected');
  // clients.push(socket);

  // Listen for data coming from clients.
  socket.on('message', function(message) {

    console.log(`${socket.id} Receive and Transmit :  ${JSON.stringify(message, null , 2)}`);
    // Broadcast the message to all connected clients.
    // for (var i=0; i<clients.length; i++) {
    //   clients[i].write(message);
    // }
    message.source = NODE_NAME;
    // Broadcast too all except the origin
    socket.broadcast.emit("message", message);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    // clients.splice(clients.indexOf(socket), 1);
  });
});


// const express = require("express");
// const app = express();
// const http = require("http");
// const server = http.createServer(app);
// const { Server } = require("socket.io");
// const io = new Server(server);
// var bodyParser = require('body-parser')

// // parse application/json
// app.use(bodyParser.json())

// io.on("connection", (socket) => {
//   console.log(`User connected: ${socket.id}`);
//   console.log(`Total users: ${io.engine.clientsCount}`);

//   socket.on("message", (message) => {
//     console.log(`${socket.id} sent ${JSON.stringify(message, null , 2)}`);
//     socket.broadcast.emit("message", message);
//   });

//   socket.on('disconnect', () => {
//     console.log('user disconnected');
//   });
  
// });

// server.listen(NODE_PORT, () => {
//   console.log(`${NODE_NAME} : listening on *:${NODE_PORT}`);
// });
