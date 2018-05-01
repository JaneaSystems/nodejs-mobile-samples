/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
  // Application Constructor
  initialize: function() {
    document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
  },

  // deviceready Event Handler
  //
  // Bind any cordova events here. Common events are:
  // 'pause', 'resume', etc.
  onDeviceReady: function() {
    this.receivedEvent('deviceready');
    startNodeProject();
  },

  // Update DOM on a Received Event
  receivedEvent: function(id) {
    var parentElement = document.getElementById(id);
    var listeningElement = parentElement.querySelector('.listening');
    var receivedElement = parentElement.querySelector('.received');

    listeningElement.setAttribute('style', 'display:none;');
    receivedElement.setAttribute('style', 'display:block;');

    console.log('Received Event: ' + id);
  }
};

function channelListener(msg) {
  // Upon receiving the infos object from the nodejs process, do something (here, just formatting the data)
  var message = JSON.parse(msg);
  var body = document.getElementByTagId("body");
  var bodyContent = "";
  for (var i; i < message.ifaces.length; i++) {
    bodyContent += message.ifaces.names[i] + ": " + message.ifaces.addresses[i] + "<br/>";
  }
  bodyContent += "Operating System: " + message.platform + " version " + massage.platform_version;
  body.innerHTML = bodyContent;
}

function startupCallback(err) {
  if (err) {
    console.log(err);
  } else {
    console.log ('Node.js Mobile Engine Started');
  }
};

function startNodeProject() {
  nodejs.channel.setListener(channelListener);
  nodejs.start('main.js', startupCallback);
};

app.initialize();
