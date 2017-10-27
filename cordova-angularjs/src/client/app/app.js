/* global nodejs, io */

angular
.module("example.nodejsmobile.app", ["ui.bootstrap"])

.factory('theSocket', ['$q', function ($q) {
  "use strict";

  function getSocket(url) {
      url = url || 'http://localhost:8081';
      return io(url, { reconnection: true });
  }
  
  var theInstance,
      foregroundDeferred,
      pendingInstanceDeferred;

  // Application has just started, it's in foreground
  foregroundDeferred = $q.defer();
  foregroundDeferred.resolve();

  function waitForForeground() {
      if (!foregroundDeferred) {
          foregroundDeferred = $q.defer();
      }
      return foregroundDeferred.promise;
  }

  function getInstance() {
      return waitForForeground().then(function () {
          if (theInstance) {
              // We already have a valid socket instance.
              return $q.resolve(theInstance);
          } else if (!theInstance && !pendingInstanceDeferred) {
              // No instance and no pending instance
              pendingInstanceDeferred = $q.defer();

              // There is no connected socket.  It needs to be reestablished.
              var pendingInstance = getSocket();

              pendingInstance.on('connect', function () {
                  console.log('Socket connection established.');
                  theInstance     = pendingInstance;
                  pendingInstance = undefined;
                  pendingInstanceDeferred.resolve(theInstance);
                  pendingInstanceDeferred = undefined;
              });

              return pendingInstanceDeferred.promise;
          } else {
              // Just give the caller back the promise that we returned previously.
              return pendingInstanceDeferred.promise;
          }
      });
  }

  function destroy() {
      if (theInstance) {
          theInstance.off(); // remove all listeners for this socket
          theInstance.disconnect();
          theInstance = undefined;
          pendingInstanceDeferred = undefined;
      }
  }

  return {
      getInstance: getInstance,
      destroy: destroy
  };
}])
.run([ '$rootScope', '$http', '$timeout', 'theSocket',
function($rootScope, $http, $timeout, theSocket) {
    'use strict';

    $rootScope.title = 'NodeJS Mobile Test';
    $rootScope.debugMessages = [];

    var counter = 0;
    function appendToLog(msg) {
        console.log(msg);
        counter++;
        $rootScope.debugMessages.push(counter + ': ' + msg);
    }

    var app = {
        // Application Constructor
        initialize: function() {
            // Bind any cordova events here. Common events are:
            // 'deviceready', pause', 'resume', etc.
            document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
            document.addEventListener('pause', this.onDevicePause.bind(this), false);
            document.addEventListener('resume', this.onDeviceResume.bind(this), false);

            if (!(window && window.cordova)) { // browser dev
                $timeout(checkHttp, 2000);
            }
        },
    
        onDeviceReady: function() {
            this.receivedEvent('deviceready');
            startNodeProject();
        },

        onDevicePause: function() {
            this.receivedEvent('pause');
            theSocket.destroy();
        },

        onDeviceResume: function() {
            this.receivedEvent('resume');
            checkHttp();
        },
    
        receivedEvent: function(id) {
            appendToLog('AnguarJs Received Event: ' + id);
        }
    };
        
    app.initialize();

    function channelListener(msg) {
        appendToLog('[AngularJs Cordova] received: ' + msg);
        checkHttp();
    }
    
    function startNodeProject() {
        nodejs.channel.setListener(channelListener);
        nodejs.start('main.js',
        function(err) {
            if (err) {
                appendToLog('AngularJs, failed NodeJs engine' + err);
            } else {
                appendToLog('AngularJs, started NodeJs engine');
                nodejs.channel.send('Hello from AngularJs Cordova!');
            }
        });
    }

    function checkHttp() {
        appendToLog('[AngularJs Cordova] checking HTTP API');
        $http.get('http://localhost:8081')
        .then(function(response) {
            $rootScope.message = JSON.stringify(response.data);
            appendToLog('HTTP response: ' + JSON.stringify(response.data));
        })
        .catch(function(err) {
            $rootScope.message = 'HTTP err:' + JSON.stringify(err);
            appendToLog('HTTP err: ' + JSON.stringify(err));
        });
    }

    function startSocket() {
        appendToLog('[AngularJs Cordova] starting socket via API');
        theSocket.getInstance()
        .then(function (socket) {
            socket.on('data_update', function(data) {
                appendToLog('AngularJs got socket data: ' + data);
                $rootScope.$digest();
            });
            socket.emit('start_data_updates', {});
        }).catch(function(err) {
            appendToLog('AngularJs Socket Error: ' + err);
        });
    }

    function stopSocket() {
        appendToLog('[AngularJs Cordova] stopping socket via API');
        theSocket.getInstance()
        .then(function (socket) {
            socket.emit('stop_data_updates', {});
            socket.off();
        }).catch(function(err) {
            appendToLog('AngularJs Socket Error: ' + err);
        });
    }

    $rootScope.doHttp  = checkHttp;
    $rootScope.doStart = startSocket;
    $rootScope.doStop  = stopSocket;
}
]);
