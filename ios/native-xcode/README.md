# Native Xcode Sample

An iOS Xcode project that uses the [`Node.js on Mobile`]( https://github.com/janeasystems/nodejs-mobile) shared library.

The sample app runs the node.js engine in a background thread to start an HTTP server on port 3000 and return the `process.versions` value. The app's Main ViewController UI has a button to query the server and show the server's response. Alternatively, it's also possible to access the server from a browser running on a different device connected to the same local network.

## Prerequisites
To run the sample on iOS you need:
 - A macOS device with the latest Xcode (Xcode version 9 or greater) with the iOS SDK version 11.0 or higher.
 - One iOS device with arm64 architecture, running iOS version 11.0 or higher.
 - A valid Apple Developer Account.

## How to run
 - Clone this project.
 - Download the Node.js on Mobile shared library from [here](https://github.com/janeasystems/nodejs-mobile/releases/download/nodejs-mobile-v0.1.7/nodejs-mobile-v0.1.7-ios.zip).
 - Copy the `NodeMobile.framework` file inside the zip's `Release-universal` path to this project's `libnode/` folder (there's a `copy-libnode.framework-here` empty file inside the project's folder for convenience).
 - In Xcode import the `ios/native-xcode/native-xcode.xcodeproj` project.
 - Select one physical iOS device as the run target.
 - In the project settings (click on the project main node), in the `Signing` portion of the `General` tab, select a valid Team and handle the provisioning profile creation/update. If you get an error that the bundle identifier cannot be used, you can simply change the bundle identifier to a unique string by appending a few characters to it.
 - Run the app. If the build process doesn't start the app right away, you might have to go to `Settings>General` in the device and enter `Device Management` or `Profiles & Device Management` to manually accept the profile.

## How the sample was developed

### Create an Xcode 9 Project
Using the Xcode 9's "Create a new Xcode Project" wizard, create a new Project with the following settings, by the order the options appear in screens:
 1. `ios` `Single View App` template selected
 1. Entered in the `ProductName` the `native-xcode` name and left the other fields with their defaults, which were:
  - Team: None
  - Organization Name: Janea Systems
  - Organization Identifier: com.janeasystems
  - Language: Objective-C
  - `Use Core Data` unselected
  - `Include Unit Tests` unselected
  - `Include UI Tests` unselected
 1. Selected a path for my project
 1. Create

### Add `NodeMobile.framework` to the build process

#### Copy `NodeMobile.framework` to the project structure:

Create the `libnode/` folder path in the project's root folder, next to the `native-xcode.xcodeproj` package.
Download the [Node.js on Mobile release](https://github.com/janeasystems/nodejs-mobile/releases/download/nodejs-mobile-v0.1.7/nodejs-mobile-v0.1.7-ios.zip), unzip it and copy the `NodeMobile.framework` file inside the zip's `Release-universal` path to `libnode/`.

#### Embed the `NodeMobile.framework` in the binary.

In the project settings (click on the project main node), drag the `NodeMobile.framework` file that is inside `libnode/`, from a Finder Window to the `Embedded Binaries` portion of the `General` tab. This will add the framework to both the `Embedded Binaries` and `Linked Frameworks and Libraries` section.

#### Turn `ENABLE_BITCODE` off.

The node binary isn't currently build with bitcode enabled, so, for the time being, we need to disable bitcode for the Application as well. 

In the project settings (click on the project main node), in the `Build Options` portion of the `Build Settings` tab, set `Enable Bitcode` to `No`.

### Create the NodeRunner object that will run `nodejs-mobile`

#### Create NodeRunner.h

Create a new `Header File` in the project's structure in the same level as the already existing code files, called `NodeRunner.h`.

This file will contain the following code:

```objectivec
#ifndef NodeRunner_h
#define NodeRunner_h
#import <Foundation/Foundation.h>

@interface NodeRunner : NSObject {}
+ (void) startEngineWithArguments:(NSArray*)arguments;
@end

#endif
```

#### Create NodeRunner.mm

Create a new `Objective-C File` in the project's structure in the same level as the already existing code files, called `NodeRunner.mm`. The `.mm` extension is important as this will indicate Xcode that this file will contain `C++` code in addition to `Objective-C` code.

This file will contain the following code to start node:

```objectivec++
#include "NodeRunner.h"
#include <NodeMobile/NodeMobile.h>
#include <string>

@implementation NodeRunner

//node's libUV requires all arguments being on contiguous memory.
+ (void) startEngineWithArguments:(NSArray*)arguments
{
    int c_arguments_size=0;
    
    //Compute byte size need for all arguments in contiguous memory.
    for (id argElement in arguments)
    {
        c_arguments_size+=strlen([argElement UTF8String]);
        c_arguments_size++; // for '\0'
    }
    
    //Stores arguments in contiguous memory.
    char* args_buffer=(char*)calloc(c_arguments_size, sizeof(char));
    
    //argv to pass into node.
    char* argv[[arguments count]];
    
    //To iterate through the expected start position of each argument in args_buffer.
    char* current_args_position=args_buffer;
    
    //Argc
    int argument_count=0;
    
    //Populate the args_buffer and argv.
    for (id argElement in arguments)
    {
        const char* current_argument=[argElement UTF8String];
        
        //Copy current argument to its expected position in args_buffer
        strncpy(current_args_position, current_argument, strlen(current_argument));
        
        //Save current argument start position in argv and increment argc.
        argv[argument_count]=current_args_position;
        argument_count++;
        
        //Increment to the next argument's expected position.
        current_args_position+=strlen(current_args_position)+1;
    }
    
    //Start node, with argc and argv.
    node_start(argument_count,argv);
}
@end
```

### Start a background thread to run `startNodeWithArguments`:

The app uses a background thread to run the Node.js engine and it supports to run only one instance of it.

The node code is a simple HTTP server on port 3000 that returns `process.versions`. This is the corresponding node code:
```js
var http = require('http');
var versions_server = http.createServer( (request, response) => {
  response.end('Versions: ' + JSON.stringify(process.versions));
});
versions_server.listen(3000);
```

For simplicity, the node code is added to the `AppDelegate.m` file.

Add the following line in the file `#import` section:
```objectivec
#import "NodeRunner.h"
```

Create a `startNode` selector and start the thread that runs the node project inside the `didFinishLaunchingWithOptions` selector, which signature should be already have been created by the wizard:
```objectivec
- (void)startNode {
    NSArray* nodeArguments = [NSArray arrayWithObjects:
                                @"node",
                                @"-e",
                                @"var http = require('http'); "
                                " var versions_server = http.createServer( (request, response) => { "
                                "   response.end('Versions: ' + JSON.stringify(process.versions)); "
                                " }); "
                                " versions_server.listen(3000); "
                                ,
                                nil
                                ];
    [NodeRunner startEngineWithArguments:nodeArguments];
}

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    NSThread* nodejsThread = nil;
    nodejsThread = [[NSThread alloc]
        initWithTarget:self
        selector:@selector(startNode)
        object:nil
    ];
    // Set 2MB of stack space for the Node.js thread.
    [nodejsThread setStackSize:2*1024*1024];
    [nodejsThread start];
    return YES;
}
```

> The iOS node runtime expects to have 1MB of stack space available. Having 2MB of stack space available is recommended.

### Run the Application

You should now be able to run the application on your physical device.

In the project settings (click on the project main node), in the `Signing` portion of the `General` tab, select a valid Team and handle the provisioning profile creation/update. If you get an error that the bundle identifier cannot be used, you can simply change the bundle identifier to a unique string by appending a few characters to it.

Try to run the app. If the build process doesn't start the app right away, you might have to go to `Settings>General` in the device and enter `Device Management` or `Profiles & Device Management` to manually accept the profile.

### Add simple UI to test

At this point, it's already possible to run the app on an iOS device and access the HTTP server from any device connected to the same local network. If the iOS device's IP is `192.168.1.100` point the browser at `http://192.168.1.100:3000/`.

However, the sample also comes with the UI to query the local HTTP server and show the response.

#### Create Button and TextView

In `Main.storyboard`, use the Xcode interface designer to create a UIButton and a UITextView components.

#### Add UI properties and Connect them

Inside the `ViewController.m` file, add the `IBOutlet` and `IBAction` declarations to the `interface` section:
```objectivec++
@interface ViewController ()
@property (weak, nonatomic) IBOutlet UIButton *myButton;
@property (weak, nonatomic) IBOutlet UITextView *myTextView;

- (IBAction)myButtonAction:(id)sender;
@end
```

In the `Assistant Editors` mode of Xcode:
- Connect the `@property (weak, nonatomic) IBOutlet UITextView *myTextView;` property from `ViewController.m` to the `UITextView` previously created in `Main.storyboard`.
- Connect the `@property (weak, nonatomic) IBOutlet UIButton *myButton;` property from `ViewController.m` to the `UIButton` previously created in `Main.storyboard`.
- Connect the `- (IBAction)myButtonAction:(id)sender;` selector from `ViewController.m` to the `UIButton` previously created in `Main.storyboard`.

Add the `- (IBAction)myButtonAction:(id)sender;` definition to the `ViewController.m` `implementation` section:
```objectivec
- (IBAction)myButtonAction:(id)sender
{
    NSString *localNodeServerURL = @"http:/127.0.0.1:3000/";
    NSURL  *url = [NSURL URLWithString:localNodeServerURL];
    NSString *versionsData = [NSString stringWithContentsOfURL:url];
    if (versionsData)
    {
        [_myTextView setText:versionsData];
    }
    
}
```

While running the application in your physical device, tapping the UI's `Button` calls the local Node.js's HTTP server and shows the resulting response in the `TextView`.
