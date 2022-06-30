var http = require('http');

const log4js = require("log4js");
const router = require("./manager/routingManager.js");

// Init Log4J
log4js.configure("./config/log4js.json");

var serverCallback = function(req, res) {
  router.handle(req, res);
};

var server = http.createServer(serverCallback);

server.listen(8080);



// var http = require('http'),
//     httpProxy = require('http-proxy');
// //
// // Create your proxy server and set the target in the options.
// //
// httpProxy.createProxyServer({target:'http://127.0.0.1:3000', changeOrigin : true}).listen(8000); 
 
// //
// // Create your target server
// //
// http.createServer(function (req, res) {
//   res.writeHead(200, { 'Content-Type': 'text/plain' });
//   res.write('request successfully proxied!' + '\n' + JSON.stringify(req.headers, true, 2));
//   res.end();
// }).listen(9000);

