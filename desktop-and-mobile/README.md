# Desktop and Mobile
### This is a sample of a desktop and mobile integration of the same application.

Desktop
=======

For the Desktop version (using Electron, based in the `desktop/` folder), there is no need to build anything to see the app in action.
Here's how to do it:
* Open a command line interface in the `desktop/` folder
* Enter the command `npm install` and wait for completion
* Enter the command `npm install --only=dev` and wait for completion
* Finally, enter the command `npm start` to boot up the application (this should work on Linux, Windows and Mac OS)

-----

You will be presented with several windows, each showing some info about your system.
This is for the sample's purpose, you don't really have to pay attention to the information.
Each window is identified by its title.

-----

To understand the code, I recommend you to read the `main.js` file along with all `*.html` files, since they all interact with each other.
Just know that, except for the "Reverse thinking" window, everything starts from the `.html` files.

Mobile
======

I have only included a cordova version of the mobile counterpart, for cross-platform purposes.
In order to have a functioning version to compile and run, enter those commands in a command line interface in the `cordova/` folder:
* Enter the command `cordova prepare` and wait for completion.
* Upon completion, you can run `cordova build (android/ios)` to create an installable package of the app in the folder `platforms/(android/ios)/build/output/`.
* You can also run `cordova run (android/ios)` to run it directly on your device (if proprely connected and installed) or in a virtual machine.

-----

You will only see your device's info on the main screen of the app.
Again, this is for this sample's purposes, they don't have any importance.
Here, no "windows", just one display.

-----

To understand the code, please read the `www/js/index.js` file to see the cordova part.
You also should read the `www/nodejs-project/main.js` file to see the nodejs-mobile part.
