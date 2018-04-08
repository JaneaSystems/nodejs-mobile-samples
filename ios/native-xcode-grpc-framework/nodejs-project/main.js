var path = require('path');
var old_dlopen = process.dlopen;
process.dlopen = function(_module, _filename) {
  console.log("DLOPEN trying to open :"+_filename);
  if(_filename.endsWith("nodejs-project/node_modules/grpc/src/node/extension_binary/node_abi-platform-arch-unknown/grpc_node.node")) {
    var newPath = path.dirname(_filename);
    newPath = path.join(newPath,'..','..','..','..','..','..','..','Frameworks','grpc_node.framework','grpc_node');
    _filename=newPath;
    console.log("DLOPEN now trying to open :"+_filename);
  }
  old_dlopen(_module,_filename);
}

var http = require('http');
var versions_server = http.createServer( (request, response) => {
  response.end('Versions: ' + JSON.stringify(process.versions));
});
versions_server.listen(3000);

var grpc=require('grpc');
