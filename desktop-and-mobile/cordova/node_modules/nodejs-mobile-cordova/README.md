# Node.js for Mobile Apps Cordova plugin

## Installation

```bash
$ cordova plugin add nodejs-mobile-cordova
```

## Requirements

 - Cordova 7.x (Cordova 8.x is currently not supported)
 - iOS 11 or higher
 - Android API 21 or higher

When building an application for the Android platform, make sure you have the [Android NDK](https://developer.android.com/ndk/index.html) installed and the environment variable `ANDROID_NDK_HOME` set, for example:
```bash
$ export ANDROID_NDK_HOME=/Users/username/Library/Android/sdk/ndk-bundle
```

## Supported Platforms

- Android (ARMv7a, x86)
- iOS (ARM64)

## Reporting Issues

We have a [central repo](https://github.com/janeasystems/nodejs-mobile/issues) where we manage all the issues related to Node.js for Mobile Apps, including specific issues of the Node.js for Mobile Apps Cordova plugin.
So please, open the issue [there](https://github.com/janeasystems/nodejs-mobile/issues).

## Cordova Methods

- `nodejs.start`
- `nodejs.startWithScript`
- `nodejs.channel.setListener`
- `nodejs.channel.send`


### nodejs.start

```js
  nodejs.start(scriptFileName, callback [, options]);
```
| Param | Type |
| --- | --- |
| scriptFileName | <code>string</code> |
| callback | <code>function</code>  |
| options | <code>[StartupOptions](#cordova.StartupOptions)</code>  |


### nodejs.startWithScript

```js
  nodejs.startWithScript(scriptBody, callback [, options]);
```
| Param | Type |
| --- | --- |
| scriptBody | <code>string</code> |
| callback | <code>function</code>  |
| options | <code>[StartupOptions](#cordova.StartupOptions)</code>  |

### nodejs.channel.setListener

```js
  nodejs.channel.setListener(listenerCallback);
```
| Param | Type |
| --- | --- |
| listenerCallback | <code>function</code> |

### nodejs.channel.send

```js
  nodejs.channel.send(message);
```
| Param | Type |
| --- | --- |
| message | <code>string</code> |

<a name="cordova.StartupOptions"></a>
### StartupOptions: <code>object</code>
| Name | Type | Default | Description |
| --- | --- | --- | --- |
| redirectOutputToLogcat | <code>boolean</code> | <code>true</code> | Allows to disable the redirection of the Node stdout/stderr to the Android logcat |

Note: the stdout/stderr redirection is applied to the whole application, the side effect is that some undesired/duplicated output may appear in the logcat.
For example, the Chromium console output `I/chromium: [INFO:CONSOLE(xx)]` is also sent to stderr and will show up in logcat has well, with the `NODEJS-MOBILE` log tag.

## Node.js Methods

```js
  var cordova = require('cordova-bridge');
```

- `cordova.channel.send`
- `cordova.channel.on`

### cordova.channel.send

```
 cordova.channel.send(message);
```
| Param | Type |
| --- | --- |
| message | <code>string</code> |

### cordova.channel.on

```
 cordova.channel.on('message', listenerCallback);
```
| Param | Type |
| --- | --- |
| 'message' | <code>const string</code> |
| listenerCallback | <code>function</code> |

## Usage

This shows how to build an iOS app that exchanges text messages between the Cordova layer and the Node.js layer.
In macOS, using `Terminal`:
```bash
$ cordova create HelloCordova
$ cd HelloCordova
$ cordova platform add ios
$ cordova plugin add nodejs-mobile-cordova
```
You can either manually create the `./www/nodejs-project/` folder, the `./www/nodejs-project/main.js` file and edit `./www/js/index.js` or use the provided helper script to do it automatically.

---
#### Set up project files using the helper script
If you choose to use the helper script, you will be asked to overwrite the existing `./www/js/index.js` file:
```bash
$ ./plugins/nodejs-mobile-cordova/install/sample-project/copy-sample-project.sh
$ overwrite www/js/index.js? (y/n [n]) y
```
The script creates the `./www/nodejs-project/` folder and adds two files:
 - `./www/nodejs-project/main.js`
 - `./www/nodejs-project/package.json`

The changes in `./www/js/index.js` are needed to invoke Node.js for Mobile Apps from Cordova.

---
#### Set up project files using the manual steps
If you want to set up the project manually, first create the project folder for the Node.js files:
```bash
$ mkdir www/nodejs-project
```
Then, with your editor of choice (we use VS Code in this example) create the `main.js` script file:
```bash
$ code www/nodejs-project/main.js
```
Add the following code to `main.js` and save the file:
```js
const cordova = require('cordova-bridge');

cordova.channel.on('message', function (msg) {
  console.log('[node] received:', msg);
  cordova.channel.send('Replying to this message: ' + msg);
});
```
Edit the cordova script file `www/js/index.js`:
```
$ code `./www/js/index.js`
```
Append the following code at the end of the file:
```js
function channelListener(msg) {
    console.log('[cordova] received:' + msg);
}

function startupCallback(err) {
    if (err) {
        console.log(err);
    } else {
        console.log ('Node.js Mobile Engine Started');
        nodejs.channel.send('Hello from Cordova!');
    }
};

function startNodeProject() {
    nodejs.channel.setListener(channelListener);
    nodejs.start('main.js', startupCallback);
    // To disable the stdout/stderr redirection to the Android logcat:
    // nodejs.start('main.js', startupCallback, { redirectOutputToLogcat: false });
};

```

Search for the `onDeviceReady` event and in the event handler add a call to `startNodeProject()`:
```js
  onDeviceReady: function() {
      this.receivedEvent('deviceready');
      startNodeProject();
  },
```
Save the changes to the `www/js/index.js` file to complete the manual steps of setting up the project files.

---

After the project files have been created, either manually or using the helper script, open the Cordova app project in Xcode:
```bash
$ open platforms/ios/HelloCordova.xcodeproj
```
Switch to Xcode:
 * select HelloCordova to view the project settings
 * in the `General` settings:
    * in the `Signing` section select a team to sign the app
    * in `Deployment Info` section select `Deployment Target` `11.0` or higher

Go back to `Terminal` to build the Cordova app
```bash
$ cordova build ios --device
```
Switch to Xcode:
 * select a target device for the project
 * run the project
 * enlarge the `Console` area, at the end of the console log it should show:

```bash
2017-10-02 18:49:18.606100+0200 HelloCordova[2182:1463518] Node.js Mobile Engine Started
[node] received: Hello from Cordova!
2017-10-02 18:49:18.690132+0200 HelloCordova[2182:1463518] [cordova] received: Replying to this message: Hello from Cordova!
```

## Node Modules
Node modules can be added to the project using `npm`.
The Node modules have to be installed in the `./www/nodejs-project/` folder and a `package.json` file needs to be added to the folder.

If you used the helper script to install the sample project, the `package.json` file is already present and you can proceed adding the desired Node modules.

If you don't know how to create the `package.json` file, just copy the sample one from `./plugins/nodejs-mobile-cordova/install/sample-project/www/nodejs-project/package.json`.
Then proceed with the installation of the Node modules you want to add to your Node.js project:
```
$ cd www/nodejs-project/
$ npm install module-name
```

Rebuild your Cordova project so that the newly added Node modules are added to the Cordova application.

On Android, the plugin extracts the project files and the Node modules from the APK assets in order to make them available to the Node.js for Mobile Apps engine. They are extracted from the APK and copied to a working folder (`context.getFilesDir().getAbsolutePath() + "/www/nodejs-project/"`) when the application is launched for the first time or a new version of the application has been installed.
Given the project folder will be overwritten after each application update, it should not be used for persistent data storage.
To expedite the process of extracting the assets files, instead of parsing the assets hierarchy, a list of files `file.list` and a list of folders `dir.list` are created when the application is compiled and then added to the application assets. On Android 6.x and older versions, this allows to work around a serious perfomance bug in the Android assets manager.
