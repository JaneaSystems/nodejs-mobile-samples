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

    newSocket.on('close', () => {
        console.log('Socket.io: close ');
    });

    newSocket.on('disconnecting', (reason) => {
        console.log('Socket.io: disconnecting. Reason: ' + reason);
    });

    newSocket.on('disconnect', (reason) => {
        console.log('Socket.io: disconnected. Reason: ' + reason);
        newSocket.removeAllListeners();
    });
});

// Keep a set of all connected sockets to destroy destroy when trying to close the server.
let connectedSockets = new Set();
server.on('connection', (conn) => {
    connectedSockets.add(conn);
    conn.on('close', () => {
        console.log('Socket.io: close ');
        connectedSockets.delete(conn);
    });
});

// Catch errors from the OS when the server is not closed before app suspension.
server.on('error', (err) => {
    console.log('Server error: ' + JSON.stringify(err));
});

function server_start() {
    if (!server.listening) {
        server.listen(8081, () => {
            console.log('NodeJS listening on 8081');
        });
    }
}

if (isMobile) {
    const cordova = require('cordova-bridge');

    cordova.app.on('pause', (lock) => {
        io.close( () => {
            console.log("Node: I have closed the server.")
            lock.release();
        });
        // The server will only close after all underlying connections have been destroyed.
        var socketsToDestroy = connectedSockets.values();
        connectedSockets.forEach( (sock) => {
            sock.destroy();
        });
        cordova.channel.post('angular-log', "pause event received.");
    });

    cordova.app.on('resume', () => {
        console.log('NodeJS received a resume event.');
        server_start();
        cordova.channel.post('angular-log', "resume event received.");
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
                    case 'load-all-dependencies':
                        try {
                            let load_module_helper = function(module_name) {
                                cordova.channel.post('angular-log', "Will require module: " + module_name);
                                let required_module = require(module_name);
                                cordova.channel.post('angular-log', "Required module successfully: " + module_name);
                            };
                            load_module_helper('os');
                            load_module_helper('path');
                            load_module_helper('events');
                            load_module_helper('net');
                            load_module_helper('dgram');
                            load_module_helper('util');
                            load_module_helper('body-parser');
                            load_module_helper('cors');
                            load_module_helper('express');
                            load_module_helper('lodash');
                            load_module_helper('q');
                            load_module_helper('request-promise');
                            load_module_helper('salti-admin');
                            load_module_helper('socket.io');
                            load_module_helper('object-sizeof');
                            load_module_helper('validator');
                            load_module_helper('bluebird');
                            load_module_helper('hexy');
                            load_module_helper('sprintf-js');
                        } catch (e) {
                            cordova.channel.post('angular-log', "Error while requiring modules: " + JSON.stringify(e) + " and stack is: " + e.stack);
                        }
                        break;
                    case 'send-msg-types':
                        sendMessageTypesToCordova();
                        break;
                    case 'app-restart':
                        // There was a restart in the Cordova side. Rerun the start actions.
                        startActions();
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

    cordova.channel.on('test-type', (msg, secondMsg, ...other_args) => {
        // Report the message payload type and contents.
        let report_msg = 'Received type "' + (typeof msg) + '" with contents : ' + JSON.stringify(msg);
        if (typeof secondMsg !== 'undefined') {
            report_msg += ' . Also received type "' + (typeof secondMsg) + '" with contents : ' + JSON.stringify(secondMsg);
        }
        if (other_args.length > 0) {
            report_msg += ' . Further arguments received: ' + JSON.stringify(other_args);
        }
        cordova.channel.post('angular-log', report_msg);
    });

    function sendMessageTypesToCordova() {
        // Test undefined.
        cordova.channel.post('test-type');
        // Test booleans.
        cordova.channel.post('test-type', false);
        cordova.channel.post('test-type', true);
        // Test null.
        cordova.channel.post('test-type', null);
        // Test numbers.
        cordova.channel.post('test-type', 1);
        cordova.channel.post('test-type', -1);
        cordova.channel.post('test-type', 0);
        cordova.channel.post('test-type', 1.3);
        cordova.channel.post('test-type', -1.3);
        // Test strings.
        cordova.channel.post('test-type', 'a');
        cordova.channel.post('test-type', "");
        cordova.channel.post('test-type', "This is a string.");
        cordova.channel.post('test-type', "These are\ntwo lines.");
        // Test objects.
        var _testobj = {
            a_number: '-4.3',
            a_null: null,
            a_boolean: false,
            a_string: 'The object string',
            an_array: [0, false, "arr_string"],
            an_object: { field_a: 'a', field_b: 3 }
        };
        cordova.channel.post('test-type', _testobj);
        cordova.channel.post('test-type', {});
        // Test arrays.
        cordova.channel.post('test-type', [1, 2, 3]);
        cordova.channel.post('test-type', []);
        cordova.channel.post('test-type', [2, _testobj, null, "other string"]);
        // Send many arguments in the same event.
        cordova.channel.post('test-type', 'two-args', _testobj);
        cordova.channel.post('test-type', 'many-args', false, true, null, 1, 0, -1.3, [1, 2, 3], _testobj);
    }

    function startActions() {
        // To run in the first start or in a restart request sent by the Cordova side.
        server_start();
        cordova.channel.post('started' , "Hi, cordova! It's node! I've started. Mind checking that HTTP?");
    }
    startActions();
}
