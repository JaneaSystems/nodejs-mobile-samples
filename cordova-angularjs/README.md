# NodeJs Mobile Example Cordova App with AngularJs

An AngularJs Cordova project that uses the [Node.js for Mobile Apps Cordova](https://github.com/janeasystems/nodejs-mobile-cordova) plugin library.

The sample app runs the Node.js engine in the Cordova to start an `HTTP` and `socket.io` server on port 8081 and sends data periodically.

## Pre-requisites

Note the instructions for the Cordova app on [Janea's site](https://code.janeasystems.com/nodejs-mobile/getting-started-cordova)

This sample also uses `bower`, `gulp` and `ios-deploy` to build and run. These can be installed through npm:
 ```
  $ npm install -g bower
  $ npm install -g gulp-cli
  $ npm install -g ios-deploy
 ```

## How to run: Clone and Install Dependencies

Clone this repository and install the development dependencies (e.g. gulp), NodeJs mobile packages, and AngularJs packages.

NOTE: All commands in the next sections should be executed on macOS, using a Terminal in the `nodejs-mobile-samples/cordova-angularjs` unless otherwise noted.

```
 $ npm install
```

## Dev and Test

You can develop and test the AngularJs and NodeJs code in a web browser and standard NodeJs server.
Several gulp scripts are provided to help with development and testing:

- `gulp serve:sync`
    - Starts a "normal" NodeJs server and launches the AngularJs app in a web browser
    - Uses browser sync and nodemon for live reload of both the server and app

- `gulp build`
    - Builds the NodeJs server and AngularJs app into the `cordova/www` folder

- `gulp clean`
    - Cleans the NodeJs server and AngularJs app from the `cordova/www` folder

- `npm run jshint`
    - Runs jshint on the NodeJs and AngularJs code

## Setup and Build Cordova App

Setup the Cordova App using the same instructions for the Cordova app on [Janea's site](https://code.janeasystems.com/nodejs-mobile/getting-started-cordova)

A script is provided for these steps:

```
 $ npm run setup-cordova
```

If you get a `Plugin doesn't support this project's cordova-ios version. cordova-ios: X.X.X, failed version requirement: <4.5.0` warning for `cordova-plugin-console`, the plugin will be skipped but the sample will still work, as the plugin was integrated in `cordova-ios` versions `>=4.5.0`.

The output app is in the `./cordova/ExampleCordovaAngular` folder.

Next, run a build to copy the NodeJs and AngularJs files to the `cordova/www` folder:

```
 $ gulp build
```

### iOS Instructions

Open the Cordova app project in Xcode:

```
 $ open cordova/ExampleCordovaAngular/platforms/ios/HelloCordova.xcworkspace
```

In Xcode:

- Select HelloCordova to view the project settings
- In the General settings:
    - In the Signing section, select a team to sign the app
    - In the Deployment Info section, select Deployment Target 11.0 or higher

Go back to the Terminal window to build the Cordova app.

```
 $ cd cordova/ExampleCordovaAngular
 $ cordova build ios --device
 or XCode 11.5
 $ cordova build ios --device --buildFlag="-UseModernBuildSystem=0" 
```

Go back to Xcode:

- Select a target device for the project
- Run the project
- The app itself will show the sequence of events; these events are also output to the console

### Android Instructions

With your device connected, run the following commands from terminal:

```
 $ cd cordova/ExampleCordovaAngular
 $ cordova run android
```

The app itself will show the sequence of events; these events are also output to logcat

On newer versions of Cordova, clear text http connections might not be allowed, for which you might have to add `android:usesCleartextTraffic="true"` in the `application` tag inside "AndroidManifest.xml".

### Starting Over

If you want to clean out the cordova app and start over, use `gulp clean:cordova`.  Then start over with the instructions in this section.
