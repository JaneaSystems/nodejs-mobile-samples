/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  Button,
  AppState,
  View
} from 'react-native';

import nodejs from 'nodejs-mobile-react-native';

export default class App extends Component<{}> {
  constructor(props){
    super(props);
    this.state = { lastNodeMessage: "No message yet." };
    this.listenerRef = null;
  }
  componentWillMount()
  {
    nodejs.start('main.js');
    this.listenerRef = ((msg) => {
      this.setState({lastNodeMessage: msg});
    });
    nodejs.channel.addListener(
      "message",
      this.listenerRef,
      this 
    );
  }
  componentWillUnmount()
  {
    if (this.listenerRef) {
      nodejs.channel.removeListener("message", this.listenerRef);
    }
  }
  componentDidMount(){
    AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        nodejs.channel.send('resume');
      }
      if (state === 'background') {
        nodejs.channel.send('suspend');
      }
    });
  }
  render() {
    return (
      <View style={styles.container}>
        <Button title="Get Versions"
          onPress={() => nodejs.channel.send('versions')}
        />
        <Text style={styles.instructions}>
          {this.state.lastNodeMessage}
        </Text>
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
