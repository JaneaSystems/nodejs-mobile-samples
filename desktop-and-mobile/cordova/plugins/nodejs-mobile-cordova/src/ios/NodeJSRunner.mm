/*
  Node.js for Mobile Apps Cordova plugin.

  Implements the API to start the Node.js engine from the Cordova plugin
  native code.
 */

#import "NodeJSRunner.hh"
#import <NodeMobile/NodeMobile.h>

@implementation NodeJSRunner: NSObject

static NSThread* nodejsThread = nil;
static NSArray* _arguments = nil;

+ (void) startEngineWithArguments:(NSArray*)arguments; {

  _arguments = arguments;

  nodejsThread = [[NSThread alloc]
    initWithTarget:self
    selector:@selector(threadMain)
    object:nil
  ];

  // Set 1MB of stack space for the Node.js thread,
  // the same as the iOS application's main thread.
  [nodejsThread setStackSize:1024*1024];

  [nodejsThread start];
}

/**
 * Private methods.
 */

+ (void)threadMain
{
  [NodeJSRunner startNodeJSEngine];
}

+ (void) startNodeJSEngine {
  int c_arguments_size = 0;
  
  // Compute byte size need for all arguments in contiguous memory.
  for (id argElement in _arguments) {
    c_arguments_size += strlen([argElement UTF8String]);
    c_arguments_size++; // for '\0'
  }
  
  // Stores arguments in contiguous memory.
  char* args_buffer = (char*)calloc(c_arguments_size, sizeof(char));
  
  // argv to pass into node.
  char* argv[[_arguments count]];
  
  // To iterate through the expected start position of each argument in args_buffer.
  char* current_args_position = args_buffer;
  
  // Argc
  int argument_count = 0;
  
  // Populate the args_buffer and argv.
  for (id argElement in _arguments) {
    const char* current_argument = [argElement UTF8String];
    
    // Copy current argument to its expected position in args_buffer
    strncpy(current_args_position, current_argument, strlen(current_argument));
    
    // Save current argument start position in argv and increment argc.
    argv[argument_count] = current_args_position;
    argument_count++;
    
    // Increment to the next argument's expected position.
    current_args_position += strlen(current_args_position)+1;
  }
  
  // Start node, with argc and argv.
  node_start(argument_count, argv);
}

@end