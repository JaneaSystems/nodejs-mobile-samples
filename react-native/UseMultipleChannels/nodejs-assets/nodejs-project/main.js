const rn_bridge = require('rn-bridge');
const fs = require('fs');
const path = require('path');

rn_bridge.app.on('pause', (lock) => {
  rn_bridge.channel.post('rn-log', 'pause event received.');
  lock.release();
});

rn_bridge.app.on('resume', () => {
  console.log('NodeJS received a resume event.');
  rn_bridge.channel.post('rn-log', 'resume event received.');
});

let listenersBackup = {};
function backupListenersOfEvent(eventName) {
  // Copies the current listeners of an event to the backup.
  listenersBackup[eventName] = rn_bridge.channel.listeners(eventName);
}
function restoreListenersOfEvent(eventName) {
  // Restores the listeners of an event from the backup.
  var backedUpListeners = listenersBackup[eventName];
  if (Array.isArray(backedUpListeners)) {
    for(var i = 0; i < backedUpListeners.length; i++) {
      rn_bridge.channel.addListener(eventName,backedUpListeners[i]);
    }
  }
}
function toggleListenersOfEvent(eventName) {
    // If there are listeners for a event, backup and remove them.
    // Otherwise, try to restore a backup.
    if (rn_bridge.channel.listenerCount(eventName) > 0) {
        backupListenersOfEvent(eventName);
        rn_bridge.channel.removeAllListeners(eventName);
        rn_bridge.channel.post('rn-log', 'Turned ' + eventName + ' listeners off.');
    } else {
        restoreListenersOfEvent(eventName);
        rn_bridge.channel.post('rn-log', 'Restored ' + eventName + ' listeners.');
    }
}

rn_bridge.channel.on('control', (msg) => {
  // Will listen for different control message objects from react-native.
  if (typeof msg === 'object') {
    if(msg && msg.action) {
      switch(msg.action) {
        case 'toggle-event-listeners':
          // Will be used to toggle events on and off.
          if (typeof msg.eventName === "string") {
            toggleListenersOfEvent(msg.eventName);
          } else {
            rn_bridge.channel.post('rn-log', 'control channel received incorrect channel name: ' + JSON.stringify(msg));
          }
          break;
        case 'send-msg-types':
          sendMessageTypesToReact();
          break;
        default:
        rn_bridge.channel.post('rn-log', "control channel received unknown action: " + JSON.stringify(msg));
      }
    } else {
      rn_bridge.channel.post('rn-log', "control channel received an object without an action: " + JSON.stringify(msg));
    }
  } else {
    rn_bridge.channel.post('rn-log', "control channel didn't receive an object.");
  }
});

rn_bridge.channel.on('node-echo', (msg) => {
  console.log('[NodeJS Mobile] received:', msg);
  rn_bridge.channel.send('NodeJS replying to react-native with this message: ' + msg);
});

rn_bridge.channel.on('test-file', (msg) => {
  var writablePath = path.join(rn_bridge.app.datadir(), "writefile.txt");
  fs.writeFile(writablePath, msg, () => {
    rn_bridge.channel.post('rn-log', 'Tried to write "' + msg + '" to "' + writablePath + '".');
    fs.readFile(writablePath, (err, data) => {
      if (err) {
        rn_bridge.channel.post('rn-log', 'Error while readding "' + writablePath + '".');
      } else {
        rn_bridge.channel.post('rn-log', 'Read "' + data + '" from "' + writablePath + '".');
      }
    });
  });
});

rn_bridge.channel.on('test-type', (msg, secondMsg, ...other_args) => {
  // Report the message payload type and contents.
  let report_msg = 'Received type "' + (typeof msg) + '" with contents : ' + JSON.stringify(msg);
  if (typeof secondMsg !== 'undefined') {
    report_msg += ' . Also received type "' + (typeof secondMsg) + '" with contents : ' + JSON.stringify(secondMsg);
  }
  if (other_args.length > 0) {
    report_msg += ' . Further arguments received: ' + JSON.stringify(other_args);
  }
  rn_bridge.channel.post('rn-log', report_msg);
});

function sendMessageTypesToReact() {
  // Test undefined.
  rn_bridge.channel.post('test-type');
  // Test booleans.
  rn_bridge.channel.post('test-type', false);
  rn_bridge.channel.post('test-type', true);
  // Test null.
  rn_bridge.channel.post('test-type', null);
  // Test numbers.
  rn_bridge.channel.post('test-type', 1);
  rn_bridge.channel.post('test-type', -1);
  rn_bridge.channel.post('test-type', 0);
  rn_bridge.channel.post('test-type', 1.3);
  rn_bridge.channel.post('test-type', -1.3);
  // Test strings.
  rn_bridge.channel.post('test-type', 'a');
  rn_bridge.channel.post('test-type', '');
  rn_bridge.channel.post('test-type', 'This is a string.');
  rn_bridge.channel.post('test-type', 'These are\ntwo lines.');
  // Test objects.
  var _testobj = {
      a_number: '-4.3',
      a_null: null,
      a_boolean: false,
      a_string: 'The object string',
      an_array: [0, false, 'arr_string'],
      an_object: { field_a: 'a', field_b: 3 }
  };
  rn_bridge.channel.post('test-type', _testobj);
  rn_bridge.channel.post('test-type', {});
  // Test arrays.
  rn_bridge.channel.post('test-type', [1, 2, 3]);
  rn_bridge.channel.post('test-type', []);
  rn_bridge.channel.post('test-type', [2, _testobj, null, 'other string']);
  // Send many arguments in the same event.
  rn_bridge.channel.post('test-type', 'two-args', _testobj);
  rn_bridge.channel.post('test-type', 'many-args', false, true, null, 1, 0, -1.3, [1, 2, 3], _testobj);
}

// Inform react-native node is initialized.
rn_bridge.channel.post('rn-log', 'Node was initialized.');
