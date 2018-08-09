/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, ScrollView} from 'react-native';
import nodejs from 'nodejs-mobile-react-native';

type Props = {};
export default class App extends Component<Props> {
  constructor(props) {
    super(props);
    this.state={
      _log:''
    };
    this._additionalEchoListeners = [];
    this._createdListenerCount = 1;
  }
  addToLog(msg) {
    // Adds to the log of messages.
    this.setState({_log : this.state._log + msg + '\n'});
  }
  clearLog(msg) {
    // Clears the message log.
    this.setState({_log : ''});
  }

  componentWillMount()
  {
    // Starts the node runtime and adds listeners to the events.
    nodejs.start('main.js');
    nodejs.channel.addListener(
      'message',
      (msg) => {
        // To receive from the default message channel.
        this.addToLog('Message from node: ' + msg);
      }
    );
    nodejs.channel.addListener(
      'rn-log',
      (msg) => {
        // Receive log requests from node.
        this.addToLog('node-log: ' + msg);
      }
    );
    nodejs.channel.addListener(
      'test-type',
      (msg, secondMsg, ...other_args) => {
        // Report the message payload type and contents.
        let report_msg = 'Received type "' + (typeof msg) + '" with contents : ' + JSON.stringify(msg);
        if (typeof secondMsg !== 'undefined') {
            report_msg += ' . Also received type "' + (typeof secondMsg) + '" with contents : ' + JSON.stringify(secondMsg);
        }
        if (other_args.length > 0) {
            report_msg += ' . Further arguments received: ' + JSON.stringify(other_args);
        }
        this.addToLog(report_msg);
      }
    );
  }

  sendEcho() {
    // Sends echo request to nodeJS.
    nodejs.channel.post('node-echo', 'Hello from React Native!');
  }

  toggleEcho() {
    // Toggles echo on and off on the nodeJS side.
    nodejs.channel.post('control', {
      action: 'toggle-event-listeners',
      eventName: 'node-echo'
    });
  }

  addAnotherEchoListener() {
    // Adds another listener to message events and saves it for later removal.
    let newListenerFunc = ( () => {
      let thisListenerId = this._createdListenerCount++;
      return (msg) => { this.addToLog('Another ' + thisListenerId + ' : ' + msg, true); };
    })();
    nodejs.channel.addListener('message', newListenerFunc);
    this._additionalEchoListeners.push(newListenerFunc);
    this.addToLog('Another listener has been added. Test it with Echo.');
  }
  removeAnotherEchoListener() {
    // Removes one of the "another" listeners from the message events.
    let listenerToRemove = this._additionalEchoListeners.shift();
    if (typeof listenerToRemove === "undefined") {
      this.addToLog('No more listeners to remove.');
    } else {
      nodejs.channel.removeListener('message', listenerToRemove);
      this.addToLog('Removed another listener.');
    }
  }

  testMessageTypesSent() {
    // Test undefined.
    nodejs.channel.post('test-type');
    // Test booleans.
    nodejs.channel.post('test-type', false);
    nodejs.channel.post('test-type', true);
    // Test null.
    nodejs.channel.post('test-type', null);
    // Test numbers.
    nodejs.channel.post('test-type', 1);
    nodejs.channel.post('test-type', -1);
    nodejs.channel.post('test-type', 0);
    nodejs.channel.post('test-type', 1.3);
    nodejs.channel.post('test-type', -1.3);
    // Test strings.
    nodejs.channel.post('test-type', 'a');
    nodejs.channel.post('test-type', "");
    nodejs.channel.post('test-type', "This is a string.");
    nodejs.channel.post('test-type', "These are\ntwo lines.");
    // Test objects.
    var _testobj = {
      a_number: '-4.3',
      a_null: null,
      a_boolean: false,
      a_string: 'The object string',
      an_array: [0, false, "arr_string"],
      an_object: { field_a: 'a', field_b: 3 }
    };
    nodejs.channel.post('test-type', _testobj);
    nodejs.channel.post('test-type', {});
    // Test arrays.
    nodejs.channel.post('test-type', [1, 2, 3]);
    nodejs.channel.post('test-type', []);
    nodejs.channel.post('test-type', [2, _testobj, null, "other string"]);
    // Send many arguments in the same event.
    nodejs.channel.post('test-type', 'two-args', _testobj);
    nodejs.channel.post('test-type', 'many-args', false, true, null, 1, 0, -1.3, [1, 2, 3], _testobj);
  }

  testMessageTypesReceived() {
    // Asks node to send messages with different types.
    nodejs.channel.post('control', {
      action: 'send-msg-types'
    });
  }

  doFileWrite() {
    var randomData=Math.random().toString(36).substring(7);
    this.addToLog('Will tell nodejs to write this to a file: ' + randomData);
    nodejs.channel.post('test-file', randomData);
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>Use Multiple Channel Events</Text>
        <View style={{flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center'}}>
          <Button title='Clear logs'
            onPress={ () => this.clearLog() }
            />
          <Button title='Send echo'
            onPress={ () => this.sendEcho() }
            />
          <Button title='Toggle echo'
            onPress={ () => this.toggleEcho() }
            />
          <Button title='Add listener'
            onPress={ () => this.addAnotherEchoListener() }
            />
          <Button title='Remove listener'
            onPress={ () => this.removeAnotherEchoListener() }
            />
          <Button title='Send types'
            onPress={ () => this.testMessageTypesSent() }
            />
          <Button title='Receive types'
            onPress={ () => this.testMessageTypesReceived() }
            />
          <Button title='Write file'
            onPress={ () => this.doFileWrite() }
            />
        </View>
        <ScrollView
          ref = { (ref) => this._scrollView = ref }
          onContentSizeChange = { () => this._scrollView.scrollToEnd() }
          >
          <Text>{this.state._log}</Text>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
