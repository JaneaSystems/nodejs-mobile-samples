'use strict';

const os = require('os');
let isMobile = false;

if ((os.platform() === "ios") ||  (os.platform() === "android")) {
    isMobile = true;
}

if (isMobile) {
    const cordova = require('cordova-bridge');

    cordova.channel.on('message', (msg) => { 
        console.log('[NodeJS Mobile] received:', msg); 
        cordova.channel.send('NodeJS replying to to cordova with this message: ' + msg);
    });
}

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

server.listen(8081, () => {
    console.log('NodeJS listening on 8081');
});
