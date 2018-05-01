/*
  Node.js for Mobile Apps Cordova plugin.

  The JNI layer between the Cordova plugin Java code and the Node.js bridge.
 */

#include <jni.h>
#include <string>
#include <stdlib.h>
#include <cstdlib>
#include <pthread.h>
#include <unistd.h>
#include <android/log.h>

#include "include/node/node.h"
#include "cordova-bridge.h"

const char *ADBTAG = "NODEJS-MOBILE";

// Forward declaration.
int start_redirecting_stdout_stderr();

// Cache the environment variable for the thread running node to call into Java.
JNIEnv* cacheEnvPointer = NULL;

extern "C"
JNIEXPORT void JNICALL
Java_com_janeasystems_cdvnodejsmobile_NodeJS_sendToNode(
    JNIEnv *env,
    jobject /* this */,
    jstring msg) {
  const char* nativeMessage = env->GetStringUTFChars(msg, 0);
  SendToNode(nativeMessage);
  env->ReleaseStringUTFChars(msg, nativeMessage);
}

extern "C" int callintoNode(int argc, char *argv[]){
  const int exit_code = node::Start(argc,argv);
  return exit_code;
}

#if defined(__arm__)
  #define CURRENT_ABI_NAME "armeabi-v7a"
#elif defined(__aarch64__)
  #define CURRENT_ABI_NAME "arm64-v8a"
#elif defined(__i386__)
  #define CURRENT_ABI_NAME "x86"
#elif defined(__x86_64__)
  #define CURRENT_ABI_NAME "x86_64"
#else
  #error "Trying to compile for an unknown ABI."
#endif

extern "C"
JNIEXPORT jstring JNICALL
Java_com_janeasystems_cdvnodejsmobile_NodeJS_getCurrentABIName(
    JNIEnv *env,
    jobject /* this */) {
    return env->NewStringUTF(CURRENT_ABI_NAME);
}

void rcv_message_from_node(const char* msg) {
  JNIEnv *env = cacheEnvPointer;
  if (!env) {
      return;
  }
  // Try to find the class.
  jclass cls2 = env->FindClass("com/janeasystems/cdvnodejsmobile/NodeJS");
  if (cls2 != nullptr) {
    // Find the method.
    jmethodID m_sendMessage = env->GetStaticMethodID(cls2, "sendMessageToCordova", "(Ljava/lang/String;)V");
    if (m_sendMessage != nullptr) {
      jstring java_msg=env->NewStringUTF(msg);
      // Call the method.
      env->CallStaticVoidMethod(cls2, m_sendMessage, java_msg);
    }
  }
}

extern "C" jint JNICALL
Java_com_janeasystems_cdvnodejsmobile_NodeJS_startNodeWithArguments(
    JNIEnv *env,
    jobject /* this */,
    jobjectArray arguments,
    jstring nodePath,
    jboolean redirectOutputToLogcat) {

  // Node's libuv requires all arguments being on contiguous memory.
  const char* path_path = env->GetStringUTFChars(nodePath, 0);
  setenv("NODE_PATH", path_path, 1);
  env->ReleaseStringUTFChars(nodePath, path_path);

  // argc to pass to Node.
  jsize argument_count = env->GetArrayLength(arguments);

  // Compute byte size need for all arguments in contiguous memory.
  int c_arguments_size = 0;
  for (int i = 0; i < argument_count ; i++) {
    c_arguments_size += strlen(env->GetStringUTFChars((jstring)env->GetObjectArrayElement(arguments, i), 0));
    c_arguments_size++; // for '\0'
  }

  // Stores arguments in contiguous memory.
  char* args_buffer = (char*)calloc(c_arguments_size, sizeof(char));

  // argv to pass into node.
  char* argv[argument_count];

  // To iterate through the expected start position of each argument in args_buffer.
  char* current_args_position = args_buffer;

  // Populate the args_buffer and argv.
  for (int i = 0; i < argument_count ; i++) {
    const char* current_argument = env->GetStringUTFChars((jstring)env->GetObjectArrayElement(arguments, i), 0);

    // Copy current argument to its expected position in args_buffer.
    strncpy(current_args_position, current_argument, strlen(current_argument));

    // Save current argument start position in argv.
    argv[i] = current_args_position;

    // Increment to the next argument's expected position.
    current_args_position += strlen(current_args_position)+1;
  }

  if (redirectOutputToLogcat == true) {
    // Start threads to show stdout and stderr in logcat.
    if (start_redirecting_stdout_stderr() == -1) {
      __android_log_write(ANDROID_LOG_ERROR, ADBTAG, "Couldn't start redirecting stdout and stderr to logcat.");
    }
  }

  RegisterBridgeCallback(&rcv_message_from_node);

  cacheEnvPointer = env;

  // Start node, with argc and argv.
  return jint(callintoNode(argument_count, argv));
}

/**
 * Redirect stdout and staderr to Android's logcat
 */

int pipe_stdout[2];
int pipe_stderr[2];
pthread_t thread_stdout;
pthread_t thread_stderr;

void redirect(int pipe, int log_level) {
  ssize_t redirect_size;
  char buf[2048];
  while ((redirect_size = read(pipe, buf, sizeof buf - 1)) > 0) {
    // __android_log_write will add a new line anyway.
    if (buf[redirect_size - 1] == '\n') {
      --redirect_size;
    }
    buf[redirect_size] = 0;
    __android_log_write(log_level, ADBTAG, buf);
  }
}

void* thread_stderr_func(void*) {
  redirect(pipe_stderr[0], ANDROID_LOG_ERROR);
  return 0;
}

void* thread_stdout_func(void*) {
  redirect(pipe_stdout[0], ANDROID_LOG_INFO);
  return 0;
}

int start_redirecting_stdout_stderr() {
  // Set stdout as unbuffered.
  setvbuf(stdout, 0, _IONBF, 0);
  pipe(pipe_stdout);
  dup2(pipe_stdout[1], STDOUT_FILENO);

  // Set stderr as unbuffered.
  setvbuf(stderr, 0, _IONBF, 0);
  pipe(pipe_stderr);
  dup2(pipe_stderr[1], STDERR_FILENO);

  if (pthread_create(&thread_stdout, 0, thread_stdout_func, 0) == -1) {
    return -1;
  }
  pthread_detach(thread_stdout);

  if(pthread_create(&thread_stderr, 0, thread_stderr_func, 0) == -1) {
    return -1;
  }
  pthread_detach(thread_stderr);

  return 0;
}