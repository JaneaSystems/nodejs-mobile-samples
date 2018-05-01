// Bridge between the Cordova UI and the NodeJS plugin
'use strict';

class Channel {};

Channel.prototype.setListener = function (callback) {
  cordova.exec(callback, callback, 'NodeJS', 'setChannelListener', null);
};

Channel.prototype.send = function (msg) {
  cordova.exec(null, null, 'NodeJS', 'sendMessageToNode', [msg]);
};

/**
 * Private methods
 */
function startEngine(command, args, callback) {
  cordova.exec(
    function(arg) {
      if (callback) {
        callback(null);
      }
    },
    function(err) {
      if (callback) {
        callback(err);
      }
    },
    'NodeJS',
    command,
    [].concat(args)
  );
};

/**
 * Module exports
 */
function start(filename, callback, options) {
  options = options || {};
  startEngine('startEngine', [filename, options], callback);
};

function startWithScript(script, callback, options) {
  options = options || {};
  startEngine('startEngineWithScript', [script, options], callback);
};

const channel = new Channel();

module.exports = exports = {
  start,
  startWithScript,
  channel
};