'use strict';

const os = require('os');
let isMobile = false;

if ((os.platform() === "ios") ||  (os.platform() === "android")) {
    isMobile = true;
}

const path = require('path');
const fs = require('fs');

const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

if (!isMobile) {
    const cors = require('cors');
    app.use(cors({
        origin: 'http://localhost:3001',
        credentials: true
    }));
}

app.get('/', (req, res) => {
    res.json({ status: 0, msg: 'Hi from express'});
});

io.on('connection', (newSocket) => {
    console.log('Socket.io: connected');

    let timer;
    newSocket.on('start_data_updates', () => {
        if (timer) {
            clearInterval(timer);
        }
        timer = setInterval(() => {
            newSocket.emit('data_update', 'socket.io data sent from NodeJs');
        }, 2000);
    });

    newSocket.on('stop_data_updates', () => {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
    });

    newSocket.on('error', (err) => {
        console.log('Socket.io: error: ' + err);
    });

    newSocket.on('disconnect', () => {
        console.log('Socket.io: disconnected');
        newSocket.removeAllListeners();
    });
});

function server_start() {
    server.listen(8081, () => {
        console.log('NodeJS listening on 8081');
    });
}

server_start();
if (isMobile) {
    const cordova = require('cordova-bridge');

    cordova.app.on('pause', () => {
        server.close();
    });

    cordova.app.on('resume', () => {
        server_start();
    });

    let listenersBackup = {};
    function backupListenersOfEvent(eventName) {
        // Copies the current listeners of an event to the backup.
        listenersBackup[eventName] = cordova.channel.listeners(eventName);
    }
    function restoreListenersOfEvent(eventName) {
        // Restores the listeners of an event from the backup.
        var backedUpListeners = listenersBackup[eventName];
        if (Array.isArray(backedUpListeners)) {
            for(var i = 0; i < backedUpListeners.length; i++) {
                cordova.channel.addListener(eventName,backedUpListeners[i]);
            }
        }
    }
    function toggleListenersOfEvent(eventName) {
        // If there are listeners for a event, backup and remove them.
        // Otherwise, try to restore a backup.
        if (cordova.channel.listenerCount(eventName) > 0) {
            backupListenersOfEvent(eventName);
            cordova.channel.removeAllListeners(eventName);
        } else {
            restoreListenersOfEvent(eventName);
        }
    }

    cordova.channel.on('control', (msg) => {
        // Will listen for different control message objects from cordova.
        if (typeof msg === 'object') {
            if(msg && msg.action) {
                switch(msg.action) {
                    case 'toggle-event-listeners':
                        // Will be used to toggle events on and off.
                        if (typeof msg.eventName === "string") {
                            toggleListenersOfEvent(msg.eventName);
                        } else {
                            cordova.channel.post('angular-log', "control channel received incorrect channel name: " + JSON.stringify(msg));
                        }
                        break;
                    default:
                        cordova.channel.post('angular-log', "control channel received unknown action: " + JSON.stringify(msg));
                }
            } else {
                cordova.channel.post('angular-log', "control channel received an object without an action: " + JSON.stringify(msg));
            }
        } else {
            cordova.channel.post('angular-log', "control channel didn't receive an object.");
        }
    });

    cordova.channel.on('node-echo', (msg) => {
        console.log('[NodeJS Mobile] received:', msg);
        cordova.channel.send('NodeJS replying to to cordova with this message: ' + msg);
    });

    cordova.channel.on('test-file', (msg) => {
        var writablePath = path.join(cordova.app.datadir(), "writefile.txt");
        fs.writeFile(writablePath, msg, () => {
            cordova.channel.post('test-file-saved', writablePath);
        });
    });

    cordova.channel.post('started' , "Hi, cordova! It's node! I've started. Mind checking that HTTP?");
}
