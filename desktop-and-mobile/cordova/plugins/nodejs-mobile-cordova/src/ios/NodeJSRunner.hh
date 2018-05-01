/*
  Node.js for Mobile Apps Cordova plugin.

  The API to start the Node.js engine from the Cordova plugin native code.
 */

@interface NodeJSRunner : NSObject
{}

+ (void) startEngineWithArguments:(NSArray*)arguments;

@end
