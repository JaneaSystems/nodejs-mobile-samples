const cordova = require('cordova-bridge');

cordova.channel.on('message', function (msg) { 
  console.log('[node] received:', msg); 
  cordova.channel.send('Replying to this message: ' + msg);
});
