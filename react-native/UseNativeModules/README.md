# React Native Use Native Modules Sample

A React Native project that uses the [Node.js for Mobile Apps React Native plugin]( https://github.com/janeasystems/nodejs-mobile-react-native) plugin to showcase building and running native modules.

In this sample, the Node.js engine runs in a background thread inside the app, executing sample code from the [sha3](https://www.npmjs.com/package/sha3) and [sqlite3](https://www.npmjs.com/package/sqlite3) native modules. The results are shown in the app UI.

**Disclaimer: Building native modules is only available on macOS and Linux at the time of writing this sample.**

## Prerequisites

Install the build prerequisites mentioned in [nodejs-mobile](https://github.com/janeasystems/nodejs-mobile) for [Android](https://github.com/janeasystems/nodejs-mobile#prerequisites-to-build-the-android-library-on-linux-ubuntudebian) and [iOS](https://github.com/janeasystems/nodejs-mobile#prerequisites-to-build-the-ios-framework-library-on-macos).

Setup your system as described in the "Building Projects with Native Code" section of React Native's [Getting Started page](https://facebook.github.io/react-native/docs/getting-started.html).
For Android, besides the environment variables mentioned, setting the environment variable ANDROID_NDK_HOME is also needed, as in this example:
```sh
export ANDROID_NDK_HOME=/Users/username/Library/Android/sdk/ndk-bundle
```

## How to run
  - Clone this project.
  - Run the required npm and react-native commands to install the required node modules in the project root (`react-native/UseNativeModules/`):
    - `$ npm install`
    - `$ react-native link`

### iOS

If you want to run the app on a physical device, you'll also have to sign the project.

 - Open the `ios/UseNativeModules.xcodeproj` project file in Xcode.
 - Select one of the physical iOS devices as the run target.
 - In the project settings (click on the project main node), in the `Signing` portion of the `General` tab, select a valid Team and let Xcode handle the provisioning profile creation/update. If you get an error that the bundle identifier cannot be used, you can simply change the bundle identifier to a unique string by appending a few characters to it.
 - Run the app. If the build process doesn't start the app right away, you might have to go to `Settings>General` in the device and enter `Device Management` or `Profiles & Device Management` to manually accept the profile.


### Android

You may need to open your app's `/android` folder in `Android Studio`, so that it detects, downloads and cofigures requirements that might be missing, like the `NDK` and `CMake` to build the native code part of the project.

- Run `react-native run-android` in the project root (`react-native/UseNativeModules/`).

#### Troubleshooting
On Android applications, the `react-native` build process is sometimes unable to rebuild assets.
If you are getting errors while building the application using `react-native run-android`, the following commands can help you do a clean rebuild of the project, when run in the project root (`react-native/UseNativeModules/`).

On Linux/macOS:
```sh
cd android
./gradlew clean
cd ..
react-native run-android
```

## Project structure

### Node.js Part

In `nodejs-assets/nodejs-project/main.js` you can find the Node.js backend code, that calls the native modules as it receives messages from the React Native part of the project:

```js
var rn_bridge = require('rn-bridge');

// sha3 module sample code adapted from its README.
function sha3SampleCode() {
  var SHA3 = require('sha3');
  var result = '';
  // Generate 512-bit digest.
  var d = new SHA3.SHA3Hash();
  d.update('foo');
  result += "Digest 1: " + d.digest('hex') + "\n";   // => "1597842a..."
  // Generate 224-bit digest.
  d = new SHA3.SHA3Hash(224);
  d.update('foo');
  result += "Digest 2: " + d.digest('hex') +"\n";   // => "daa94da7..."
  return result;
}

// sqlite3 module sample code adapted from its README.
function sqlite3SampleCode( resultsCallback ) {
  var sqlite3 = require('sqlite3').verbose();
  var db = new sqlite3.Database(':memory:');

  db.serialize(function() {
    db.run("CREATE TABLE lorem (info TEXT)");

    var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
    for (var i = 0; i < 10; i++) {
        stmt.run("Ipsum " + i);
    }
    stmt.finalize();

    db.all("SELECT rowid AS id, info FROM lorem", function(err, rows) {
      var result = '';
      rows.forEach((row) =>
        result += row.id + ": " + row.info + "\n"
      );
      resultsCallback(result);
    });

  });

  db.close();
}

rn_bridge.channel.on('message', (msg) => {
  try {
    switch(msg) {
      case 'versions':
        rn_bridge.channel.send(
          "Versions: " +
          JSON.stringify(process.versions)
        );
        break;
      case 'sha3':
        rn_bridge.channel.send(
          "sha3 output:\n" +
          sha3SampleCode()
        );
        break;
      case 'sqlite3':
        sqlite3SampleCode( (result) =>
          rn_bridge.channel.send(
              "sqlite3 output:\n" +
              result
            )
        );
        break;
      default:
        rn_bridge.channel.send(
          "unknown request:\n" +
          msg
        );
        break;
    }
  } catch (err)
  {
    rn_bridge.channel.send("Error: " + JSON.stringify(err) + " => " + err.stack );
  }
});

// Inform react-native node is initialized.
rn_bridge.channel.send("Node was initialized. Versions: " + JSON.stringify(process.versions));
```

### React Native part

The React Native interface takes care of querying Node.js for each module by the means of distinct UI buttons and showing the results in the UI.

App.js contents:
```js
...
import nodejs from 'nodejs-mobile-react-native';

type Props = {};
export default class App extends Component<Props> {
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
  render() {
    return (
      <View style={styles.container}>
        <Button title="Get Versions"
          onPress={() => nodejs.channel.send('versions')}
        />
        <Button title="Run sha3"
          onPress={() => nodejs.channel.send('sha3')}
        />
        <Button title="Run sqlite3"
          onPress={() => nodejs.channel.send('sqlite3')}
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
