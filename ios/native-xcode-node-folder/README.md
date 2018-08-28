# Native Xcode Sample using a Node Project folder

An iOS Xcode project that uses the [`Node.js on Mobile`]( https://github.com/janeasystems/nodejs-mobile) shared library, as an example of using a Node Project folder inside the Application.

The sample app runs the node.js engine in a background thread to start an HTTP server on port 3000 and return the `process.versions` value alongside the result of using the [`left-pad` npm module](https://www.npmjs.com/package/left-pad). The app's Main ViewController UI has a button to query the server and show the server's response. Alternatively, it's also possible to access the server from a browser running on a different device connected to the same local network.

## Prerequisites
To run the sample on iOS you need:
 - A macOS device with the latest Xcode (Xcode version 9 or greater) with the iOS SDK version 11.0 or higher.
 - One iOS device with arm64 architecture, running iOS version 11.0 or higher.
 - A valid Apple Developer Account.

## How to run
 - Clone this project.
 - Run `npm install` inside `ios/native-xcode-node-folder/nodejs-project/`.
 - Download the Node.js on Mobile shared library from [here](https://github.com/janeasystems/nodejs-mobile/releases/download/nodejs-mobile-v0.1.7/nodejs-mobile-v0.1.7-ios.zip).
 - Copy the `NodeMobile.framework` file inside the zip's `Release-universal` path to this project's `NodeMobile/` folder (there's a `copy-NodeMobile.framework-here` empty file inside the project's folder for convenience).
 - In Xcode import the `ios/native-xcode-node-folder/native-xcode-node-folder.xcodeproj` project.
 - Select one physical iOS device as the run target.
 - In the project settings (click on the project main node), in the `Signing` portion of the `General` tab, select a valid Team and handle the provisioning profile creation/update. If you get an error that the bundle identifier cannot be used, you can simply change the bundle identifier to a unique string by appending a few characters to it.
 - Run the app. If the build process doesn't start the app right away, you might have to go to `Settings>General` in the device and enter `Device Management` or `Profiles & Device Management` to manually accept the profile.

## How the sample was developed

This sample was built on top of the [`native-xcode` sample from this repo](../native-xcode), with the same functionality, but uses a `nodejs-project` folder that contains the node part of the project.

### Create the `nodejs-project` folder

Create a `nodejs-project` folder inside the project and add it as a Resource to the Xcode project.
It contains two files inside:

- `main.js`
```js
var http = require('http');
var versions_server = http.createServer( (request, response) => {
  response.end('Versions: ' + JSON.stringify(process.versions));
});
versions_server.listen(3000);
```

- `package.json`
```
{
  "name": "native-xcode-node-project",
  "version": "0.0.1",
  "description": "node part of the project",
  "main": "main.js",
  "author": "janeasystems",
  "license": ""
}
```

### Add an npm module to the `nodejs-project`

Having a `nodejs-project` path with a `package.json` inside is helpful for using npm modules, by running `npm install {module_name}` inside `nodejs-project` so that the modules are also packaged with the application and made available at runtime.

Install the `left-pad` module, by running `npm install left-pad` inside the `nodejs-project` folder.

Update `main.js` to use the module:
```js
var http = require('http');
var leftPad = require('left-pad');
var versions_server = http.createServer( (request, response) => {
  response.end('Versions: ' + JSON.stringify(process.versions) + ' left-pad: ' + leftPad(42, 5, '0'));
});
versions_server.listen(3000);
```

### Start the node runtime from the Node Project

Change the code that starts the node runtime in `AppDelegate.m` to find the `main.js` inside the Application's bundle and start from there:

```objectivec
- (void)startNode {
    NSString* srcPath = [[NSBundle mainBundle] pathForResource:@"nodejs-project/main.js" ofType:@""];
    NSArray* nodeArguments = [NSArray arrayWithObjects:
                                @"node",
                                srcPath,
                                nil
                                ];
    [NodeRunner startEngineWithArguments:nodeArguments];
}
```
