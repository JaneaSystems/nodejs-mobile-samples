'use strict';

// Standard nodejs-mobile requirements
const cordova = require('cordova-bridge');

// This is for the purpose of the sample
const os = require('os');
const ifaces = os.networkInterfaces();

// Some code to gather info about the system, for this sample's purpose
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

// Sends a string of the gathered info's object to Cordova
cordova.channel.send(JSON.stringigfy(infos));
