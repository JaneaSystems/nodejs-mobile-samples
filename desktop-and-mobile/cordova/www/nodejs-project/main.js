'use strict';

const cordova = require('cordova-bridge');

const os = require('os');
const ifaces = os.networkInterfaces();

var infos = null;

var localIfaces = [];
var localIP = [];

Object.keys(ifaces).forEach(function (ifname) {
  var alias = 0;

  ifaces[ifname].forEach(function (iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      return;
    }

    if (alias >= 1) {
      localIfaces.push(ifname + ':' + alias);
      localIP.push(iface.address);
    } else {
      localIfaces.push(ifname);
      localIP.push(iface.address);
    }
    ++alias;
  });
});

infos = {
  "ifaces": {
    "names": localIfaces,
    "addresses": localIP
  },
  "platform": os.platform(),
  "platform_version": os.release(),
  "cpu_arch": os.arch()
}

console.log(JSON.stringify(infos));

cordova.channel.send(JSON.stringigfy(infos));
