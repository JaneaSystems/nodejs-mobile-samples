# Cordova Use Native Modules Sample

A Cordova project that uses the [Node.js for Mobile Apps Cordova plugin]( https://github.com/janeasystems/nodejs-mobile-cordova) plugin to showcase building and running native modules.

In this sample, the Node.js engine runs in a background thread inside the app, executing sample code from the [sha3](https://www.npmjs.com/package/sha3) and [sqlite3](https://www.npmjs.com/package/sqlite3) native modules. The results are shown in the app UI.

**Disclaimer: Building native modules is only available on macOS and Linux at the time of writing this sample.**

## Prerequisites

Install the build prerequisites mentioned in [nodejs-mobile](https://github.com/janeasystems/nodejs-mobile) for [Android](https://github.com/janeasystems/nodejs-mobile#prerequisites-to-build-the-android-library-on-linux-ubuntudebian) and [iOS](https://github.com/janeasystems/nodejs-mobile#prerequisites-to-build-the-ios-framework-library-on-macos).

Setup your system as described in the "Installing the Requirements" sections of Cordova's [Android Platform Guide page](https://cordova.apache.org/docs/en/7.x/guide/platforms/android/index.html#installing-the-requirements) and/or [iOS Platform Guide page](https://cordova.apache.org/docs/en/7.x/guide/platforms/ios/index.html#installing-the-requirements).
For Android, besides the environment variables mentioned, setting the environment variable ANDROID_NDK_HOME is also needed, as in this example:
```sh
export ANDROID_NDK_HOME=/Users/username/Library/Android/sdk/ndk-bundle
```

## How to run
  - Clone this project:
    - `$ git clone https://github.com/janeasystems/nodejs-mobile-samples`
  - Enter the project root:
    - `$ cd nodejs-mobile-samples/cordova/UseNativeModules/`)
  - Run the Cordova command to install the platforms and plugin:
    - `$ cordova prepare`
  - Run the npm script that prepares the Node.js part of the project:
    - `$ npm run prepare-nodejs`

### iOS

- Run `cordova prepare ios` in the project root (`cordova/UseNativeModules/`).

- If you want to run the app on a physical device, you'll also have to sign the project:

  - Open the `platforms/ios/UseNativeModules.xcodeproj` project file in Xcode.
  - Select one of the physical iOS devices as the run target.
  - In the project settings (click on the project main node), in the `Signing` portion of the `General` tab, select a valid Team and let Xcode handle the provisioning profile creation/update. If you get an error that the bundle identifier cannot be used, you can simply change the bundle identifier to a unique string by appending a few characters to it.
  - Run the app. If the build process doesn't start the app right away, you might have to go to `Settings>General` in the device and enter `Device Management` or `Profiles & Device Management` to manually accept the profile.

- Run `cordova run ios` in the project root (`cordova/UseNativeModules/`).

### Android

- Run `cordova prepare android` in the project root (`cordova/UseNativeModules/`).

You may need to open your app's `/android` folder in `Android Studio`, so that it detects, downloads and cofigures requirements that might be missing, like the `NDK` and `CMake` to build the native code part of the project.

- Run `cordova run android` in the project root (`cordova/UseNativeModules/`).

## Project structure

### Node.js Part

In `www/nodejs-project/main.js` you can find the Node.js backend code, that calls the native modules as it receives messages from the Cordova part of the project:

```js
// Require the 'cordova-bridge' to enable communications between the
// Node.js app and the Cordova app.
const cordova = require('cordova-bridge');

//sha3 module sample code from its README.
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

//sqlite3 module sample code from its README.
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

cordova.channel.on('message', (msg) => {
  try {
    switch(msg) {
      case 'versions':
        cordova.channel.send(
          "Versions: " +
          JSON.stringify(process.versions)
        );
        break;
      case 'sha3':
        cordova.channel.send(
          "sha3 output:\n" +
          sha3SampleCode()
        );
        break;
      case 'sqlite3':
        sqlite3SampleCode( (result) =>
        cordova.channel.send(
              "sqlite3 output:\n" +
              result
            )
        );
        break;
      default:
        cordova.channel.send(
          "unknown request:\n" +
          msg
        );
        break;
    }
  } catch (err)
  {
    cordova.channel.send("Error: " + JSON.stringify(err) + " => " + err.stack );
  }
});

// Inform cordova node is initialized.
cordova.channel.send("Node was initialized. Versions: " + JSON.stringify(process.versions));
```

### Cordova part

The Cordova interface takes care of querying Node.js for each module by the means of distinct UI buttons and showing the results in the UI.

`www/js/index.js` contents:
```js
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
```