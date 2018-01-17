# React Native Suspend Resume Sample

A React-Native project that uses the [`Node.js for Mobile Apps React Native plugin`]( https://github.com/janeasystems/nodejs-mobile-react-native) shared library.

The sample app runs the Node.js engine in a background thread to start an HTTP server on port 3001 and return the `process.versions` value. It also uses the react-native bridge to send suspend and resume commands to close and reopen the HTTP server when the application goes to the background and back to the foreground. The react-native bridge also returns the process.versions into the UI.

It's possible to access the server from a browser running on a different device connected to the same local network, to verify that the Node.js process running in the background is closing the HTTP server when the app leaves the foreground state.

## How to run
  - Clone this project.
  - Run the required npm and react-native commands to install the required node modules in the project root (`react-native/SuspendResume/`):
    - `npm install`
    - `react-native link`

### iOS

As currently only `arm64` binaries are available, you need a physical device to run the project, so you'll also have to sign the project.

 - Open the `ios/SuspendResume.xcodeproj` project file in Xcode.
 - Select one of the physical iOS devices as the run target.
 - In the project settings (click on the project main node), in the `Signing` portion of the `General` tab, select a valid Team and handle the provisioning profile creation/update. If you get an error that the bundle identifier cannot be used, you can simply change the bundle identifier to a unique string by appending a few characters to it.
 - Run the app. If the build process doesn't start the app right away, you might have to go to `Settings>General` in the device and enter `Device Management` or `Profiles & Device Management` to manually accept the profile.


### Android

You may need to open your app's `/android` folder in `Android Studio`, so that it detects, downloads and cofigures requirements that might be missing, like the `NDK` and `CMake` to build the native code part of the project.

- Run `react-native run-android` in the project's root(`react-native/SuspendResume/`).

#### Troubleshooting
On Android applications, the `react-native` build process is sometimes unable to rebuild assets.
If you are getting errors while building the application using `react-native run-android`, the following commands can help you do a clean rebuild of the project, when run in the project's root(`react-native/SuspendResume/`).

On Windows:
```sh
cd android
gradlew clean
cd ..
react-native run-android
```

On Linux/macOS:
```sh
cd android
./gradlew clean
cd ..
react-native run-android
```

## Project structure

### Node.js Part

In `node-root/node-app/main.js` You can find the node.js back-end, that controls the HTTP server as it receives lifecycle events from the React Native part of the project:

```js
var http = require('http');
var rn_bridge = require('./rn-bridge/index.js');

let msg_number=0;

var listVersionsServer = http.createServer( (request, response) => {
  response.end('Versions: ' + JSON.stringify(process.versions));
});

let listVersionsHTTPServer = listVersionsServer.listen(3001);

// Echo every message received from react-native.
rn_bridge.channel.on('message', (msg) => {
  switch(msg) {
    case 'versions':
      msg_number++;
      rn_bridge.channel.send(
        "This is message number " +
        msg_number +
        ". Versions: " +
        JSON.stringify(process.versions)
      );
      break;
    case 'suspend':
      listVersionsHTTPServer.close();
      break;
    case 'resume':
      if(!listVersionsHTTPServer.listening)
        listVersionsHTTPServer = listVersionsServer.listen(3001);
      break;
    default:
      break;
  }
});

// Inform react-native node is initialized.
rn_bridge.channel.send("Node was initialized.");
```

### React Native part

The React Native interface takes care of querying `Node.js` for versions and showing it in the UI. It also signals when the App enters the background and comes back again, through `AppState`.

App.js contents:
```js
...
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
...
```


