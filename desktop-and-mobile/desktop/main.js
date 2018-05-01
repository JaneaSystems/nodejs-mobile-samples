'use strict';

const os = require('os');
const ifaces = os.networkInterfaces();

const {app, BrowserWindow, ipcMain} = require('electron');

ipcMain.on("infosRequest", function (event, arg = null) {
  switch (arg) {
    case "interfaces":
      event.sender.send("infosResponse", JSON.stringify(infos.ifaces));
      break;
    case "platform":
      event.sender.send("infosResponse", [infos.platform, infos.platform_version]);
      break;
    default:
      event.sender.send("infosResponse", JSON.stringify(infos));
  }
});

ipcMain.on("syncInfosRequest", function (event) {
  event.returnValue = infos.platform;
});

setTimeout(function () {
  reverseWindow.webContents.send("infosReverse", infos.platform)
}, 5000);

/************************************************************/

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

/************************************************************/

app.on("window-all-closed", function () {
  app.quit();
});

let firstWindow, secondWindow, thirdWindow, syncWindow, reverseWindow;

app.on("ready", function () {
  firstWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    skipTaskbar: true,
    toolbar: false
  });

  firstWindow.setMenu(null);

  firstWindow.loadURL("file://" + __dirname + "/index.html");

  firstWindow.webContents.openDevTools();

  firstWindow.on("closed", function () {
    firstWindow = null;
  });

  secondWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    skipTaskbar: true,
    toolbar: false
  });

  secondWindow.setMenu(null);

  secondWindow.loadURL("file://" + __dirname + "/infos_1.html");

  secondWindow.webContents.openDevTools();

  secondWindow.on("closed", function () {
    secondWindow = null;
  });

  thirdWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    skipTaskbar: true,
    toolbar: false
  });

  thirdWindow.setMenu(null);

  thirdWindow.loadURL("file://" + __dirname + "/infos_2.html");

  thirdWindow.webContents.openDevTools();

  thirdWindow.on("closed", function () {
    thirdWindow = null;
  });

  syncWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    skipTaskbar: true,
    toolbar: false
  });

  syncWindow.setMenu(null);

  syncWindow.loadURL("file://" + __dirname + "/synchronous.html");

  syncWindow.webContents.openDevTools();

  syncWindow.on("closed", function () {
    thirdWindow = null;
  });

  reverseWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    skipTaskbar: true,
    toolbar: false
  });

  reverseWindow.setMenu(null);

  reverseWindow.loadURL("file://" + __dirname + "/reverse.html");

  reverseWindow.webContents.openDevTools();

  reverseWindow.on("closed", function () {
    reverseWindow = null;
  });
});
