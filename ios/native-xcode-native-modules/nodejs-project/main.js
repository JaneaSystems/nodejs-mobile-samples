var http = require('http' );
var versions_server = http.createServer( (request, response) => {
  response.end('Versions : ' + JSON.stringify(process.versions));
});
versions_server.listen(3000);
console.log("Node.js runtime has started.");

var grpc=require('grpc');
