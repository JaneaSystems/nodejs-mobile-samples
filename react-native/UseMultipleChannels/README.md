# React Native Use Multiple Channel Events Sample

A React Native project that uses the [Node.js for Mobile Apps React Native plugin]( https://github.com/janeasystems/nodejs-mobile-react-native) plugin to showcase using multiple channel events.

In this sample, the Node.js engine runs in a background thread inside the app and the UI provides buttons to test channel features and an area to show the resulting log:

- Send Echo : Sends a `node-echo` event that node will send back to react-native through a `message` event.
- Toggle Echo : Uses a `control` event to turn the listening of `node-echo` events on and off in the node runtime. No `node-echo` event messages will be returned while that listener is turned off.
- Add listener : Adds an additional listener to the `message` events in the UI.
- Remove listener : Removes one of the additional listeners added to the `message` events in the React Native runtime.
- Send types: Sends many different messages with different types to the node runtime.
- Receive types: Uses a `control` event to ask node to send many different messages with different types to the React Native runtime.
- Write file: Uses a `test-file` event to ask node to write a file in a writable path.

**Note:** The node runtime will report receiving `pause` and `resume` events when the app is paused and resumed, respectively.

## How to run
  - Clone this project.
  - Run the required npm and react-native commands to install the required node modules in the project root (`react-native/UseMultipleChannels/`):
    - `$ npm install`
    - `$ react-native link`

### iOS

If you want to run the app on a physical device, you'll also have to sign the project.

 - Open the `ios/UseMultipleChannels.xcodeproj` project file in Xcode.
 - Select one of the physical iOS devices as the run target.
 - In the project settings (click on the project main node), in the `Signing` portion of the `General` tab, select a valid Team and let Xcode handle the provisioning profile creation/update. If you get an error that the bundle identifier cannot be used, you can simply change the bundle identifier to a unique string by appending a few characters to it.
 - Run the app. If the build process doesn't start the app right away, you might have to go to `Settings>General` in the device and enter `Device Management` or `Profiles & Device Management` to manually accept the profile.


### Android

You may need to open your app's `/android` folder in `Android Studio`, so that it detects, downloads and cofigures requirements that might be missing, like the `NDK` and `CMake` to build the native code part of the project.

- Run `react-native run-android` in the project root (`react-native/UseMultipleChannels/`).

#### Troubleshooting
On Android applications, the `react-native` build process is sometimes unable to rebuild assets.
If you are getting errors while building the application using `react-native run-android`, the following commands can help you do a clean rebuild of the project, when run in the project root (`react-native/UseMultipleChannels/`).

On Linux/macOS:
```sh
cd android
./gradlew clean
cd ..
react-native run-android
```

## Project structure

In [`nodejs-assets/nodejs-project/main.js`](nodejs-assets/nodejs-project/main.js) you can find the Node.js backend code and in [`App.js`](App.js) you can find the React Native code.
