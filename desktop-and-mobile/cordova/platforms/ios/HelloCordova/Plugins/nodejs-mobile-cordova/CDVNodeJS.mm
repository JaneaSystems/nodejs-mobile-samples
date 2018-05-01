/*
  Node.js for Mobile Apps Cordova plugin.

  Implements the plugin APIs exposed to the Cordova layer and routes messages
  between the Cordova layer and the Node.js engine.
 */

#import <Cordova/CDV.h>
#import "CDVNodeJS.hh"
#import "NodeJSRunner.hh"
#import <NodeMobile/NodeMobile.h>
#import "cordova-bridge.h"

#ifdef DEBUG
  #define LOG_FN NSLog(@"%s", __PRETTY_FUNCTION__);
#else
  #define LOG_FN
#endif

static CDVNodeJS* activeInstance = nil;

@implementation CDVNodeJS

/**
 * A method that can be called from the C++ Node native module (i.e. cordova-bridge.ccp).
 */
void sendMessageToCordova(const char* msg) {
  CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:[NSString stringWithUTF8String:msg]];
  [pluginResult setKeepCallbackAsBool:TRUE];
  [activeInstance.commandDelegate sendPluginResult:pluginResult callbackId:activeInstance.messageListenerCallbackId];
}

// The callback id of the Cordova channel listener
NSString* messageListenerCallbackId = nil;

+ (CDVNodeJS*) activeInstance {
  return activeInstance;
}

- (void) pluginInitialize {
  LOG_FN

  NSString* const NODE_PATH = @"NODE_PATH";
  NSString* const BUILTIN_MODULES = @"/www/nodejs-mobile-cordova-assets/builtin_modules";
  NSString* const NODE_ROOT = @"/www/nodejs-project/";

  // The 'onAppTerminate', 'onReset' and 'onMemoryWarning' events are already
  // registered in the super class while 'onPause' and 'onResume' are not.
  [[NSNotificationCenter defaultCenter] addObserver:self
                                        selector:@selector(onPause)
                                        name:UIApplicationDidEnterBackgroundNotification object:nil];

  [[NSNotificationCenter defaultCenter] addObserver:self
                                        selector:@selector(onResume)
                                        name:UIApplicationWillEnterForegroundNotification object:nil];
  
  RegisterBridgeCallback(sendMessageToCordova);

  NSString* nodePath = [[NSProcessInfo processInfo] environment][NODE_PATH];
  NSString* appPath = [[NSBundle mainBundle] bundlePath];
  NSString* builtinModulesPath = [appPath stringByAppendingString:BUILTIN_MODULES];
  NSString* nodeRootPath = [appPath stringByAppendingString:NODE_ROOT];

  if (nodePath == NULL) {
    nodePath = builtinModulesPath;
  } else {
    nodePath = [nodePath stringByAppendingString:@":"];
    nodePath = [nodePath stringByAppendingString:builtinModulesPath];
  }
  nodePath = [nodePath stringByAppendingString:@":"];
  nodePath = [nodePath stringByAppendingString:nodeRootPath];

  setenv([NODE_PATH UTF8String], (const char*)[nodePath UTF8String], 1);

  activeInstance = self;
}

/**
 * Handlers for pre-registered events:
 * - onAppTerminate
 * - onMemoryWarning
 * - onReset
 */

- (void) onAppTerminate {
  LOG_FN
}

- (void) onMemoryWarning {
  LOG_FN
}

- (void) onReset {
  LOG_FN
}

/**
 * Handlers for events registered by the plugin:
 * - onPause
 * - onResume
 */

- (void) onPause {
  LOG_FN
}

- (void) onResume {
  LOG_FN
}

/**
 * Methods available to be called by the cordova layer using 'cordova.exec'.
 */

- (void) setChannelListener:(CDVInvokedUrlCommand*)command
{
  LOG_FN

  self.messageListenerCallbackId = command.callbackId;
}

- (void) sendMessageToNode:(CDVInvokedUrlCommand*)command {
  NSString* msg = [command argumentAtIndex:0];
  // Call the native module API
  SendToNode((const char*)[msg UTF8String]);
}

- (void) startEngine:(CDVInvokedUrlCommand*)command {
  LOG_FN

  NSString* errorMsg = nil;
  NSString* scriptPath = nil;
  CDVPluginResult* pluginResult = nil;
  NSString* scriptFileName = [command argumentAtIndex:0];
  NSDictionary* options = [command argumentAtIndex:1];

#ifdef DEBUG
  for (id key in [options allKeys]) {
    NSLog(@"Start engine option: %@ -> %@", key, [options objectForKey:key]);
  }
#endif

  if ([scriptFileName length] == 0) {
    errorMsg = @"Arg was null";
  } else {
    NSString* appPath = [[NSBundle mainBundle] bundlePath];
    scriptPath = [appPath stringByAppendingString:@"/www/nodejs-project/"];
    scriptPath = [scriptPath stringByAppendingString:scriptFileName];
    if ([[NSFileManager defaultManager] fileExistsAtPath:scriptPath] == FALSE) {
      errorMsg = @"File not found";
      NSLog(@"%@: %@", errorMsg, scriptPath);
    }
  }

  if (errorMsg == nil) {
    NSArray* arguments = [NSArray arrayWithObjects:
                          @"node",
                          scriptPath,
                          nil
                        ];

    [NodeJSRunner startEngineWithArguments:arguments];
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:@""];
  } else {
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:errorMsg];
  }
  [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void) startEngineWithScript:(CDVInvokedUrlCommand*)command {
  LOG_FN

  NSString* errorMsg = nil;
  CDVPluginResult* pluginResult = nil;
  NSString* scriptBody = [command argumentAtIndex:0];
  NSDictionary* options = [command argumentAtIndex:1];

#ifdef DEBUG
  for (id key in [options allKeys]) {
    NSLog(@"Start engine option: %@ -> %@", key, [options objectForKey:key]);
  }
#endif

  if ([scriptBody length] == 0) {
    errorMsg = @"Script is empty";
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:errorMsg];
  } else {
    NSArray* arguments = [NSArray arrayWithObjects:
                          @"node",
                          @"-e",
                          scriptBody,
                          nil
                        ];

    [NodeJSRunner startEngineWithArguments:arguments];
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:@""];
  }
  [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

@end
