var app = {

  initialize: function() {
    document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
  },

  onDeviceReady: function() {
    document.getElementById('callversionsbutton').onclick = function() {
      nodejs.channel.send('versions');
    };
    document.getElementById('callsqlite3button').onclick = function() {
      nodejs.channel.send('sqlite3');
    };
    document.getElementById('callsha3button').onclick = function() {
      nodejs.channel.send('sha3');
    };
    startNodeProject();
  },

};

app.initialize();

function showMessage(msg) {
  document.getElementById('messageslog').innerHTML = '<br/>' + msg ;
}

function channelListener(msg) {
  showMessage(msg);
};

// This is the callback passed to 'nodejs.start()' to be notified if the Node.js
// engine has started successfully.
function startupCallback(err) {
  if (err) {
    console.log(err);
    showMessage(err);
  } else {
    console.log ('Node.js Mobile Engine started');
    showMessage('Node.js Mobile Engine started');
  }
};

// The entry point to start the Node.js app.
function startNodeProject() {
  nodejs.channel.setListener(channelListener);
  nodejs.start('main.js', startupCallback);
};
