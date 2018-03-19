# Native Gradle Sample using a Node Project folder

An Android Studio project that uses the [`Node.js on Mobile`]( https://github.com/janeasystems/nodejs-mobile) shared library, as an example of using a Node Project folder inside the Application.

The sample app runs the node.js engine in a background thread to start an HTTP server on port 3000. The app's Main Activity UI has a button to query the server and show the server's response (i.e. the `process.versions` value). Alternatively, it's also possible to access the server from a browser running on a different device connected to the same local network.

## How to run
 - Clone this project.
 - Download the Node.js on Mobile shared library from [here](https://github.com/janeasystems/nodejs-mobile/releases/download/nodejs-mobile-v0.1.4/nodejs-mobile-v0.1.4-android.zip).
 - Copy the `bin/` folder from inside the downloaded zip file to `app/libnode/bin` (There are `copy-libnode.so-here` files in each architecture's path for convenience). If it's been done correctly you'll end with the following paths for the binaries:
   - `app/libnode/bin/arm64-v8a/libnode.so`
   - `app/libnode/bin/armeabi-v7a/libnode.so`
   - `app/libnode/bin/x86/libnode.so`
   - `app/libnode/bin/x86_64/libnode.so`
 - In Android Studio import the `android/native-gradle/` gradle project. It will automatically check for dependencies and prompt you to install missing requirements (i.e. you may need to update the Android SDK build tools to the required version (25.0.3) and install CMake to compile the C++ file that bridges Java to the Node.js on Mobile library).
 - After the gradle build completes, run the app on a compatible device.


## How the sample was developed

This sample was built on top of the [`native-gradle` sample from this repo](https://github.com/janeasystems/nodejs-mobile-samples/tree/master/android/native-gradle), with the same functionality, but uses a `nodejs-project` folder that contains the node part of the project.

### Create the `nodejs-project` folder

Create a `nodejs-project` folder inside the project, in Gradle's default folder for Android's application assets (`app/src/main/assets/nodejs-project`). Create the `main.js` and `package.json` files inside:

- `app/src/main/assets/nodejs-project/main.js` contents:
```js
var http = require('http');
var versions_server = http.createServer( (request, response) => {
  response.end('Versions: ' + JSON.stringify(process.versions));
});
versions_server.listen(3000);
console.log('The node project has started.');
```

- `app/src/main/assets/nodejs-project/package.json` contents:
```js
{
  "name": "native-gradle-node-project",
  "version": "0.0.1",
  "description": "node part of the project",
  "main": "main.js",
  "author": "janeasystems",
  "license": ""
}
```

> Having a `nodejs-project` path with a `package.json` inside is helpful for using npm modules, by running `npm install {module_name}` inside `nodejs-project` so that the modules are also packaged with the application and made available at runtime.

### Copy the `nodejs-project` at runtime and start from there

To start the `Node.js` engine runtime with a file path, we need to first copy the project to somewhere in the Android file system, because the Android Application's APK is an archive file and `Node.js` won't be able to start running from there. For this purpose, we choose to copy the nodejs-project into the Application's `FilesDir`.

Add the helper functions to `app/src/main/java/com/yourorg/sample/MainActivity.java`:
```java
import android.content.Context;
import android.content.res.AssetManager;

...

    private static boolean deleteFolderRecursively(File file) {
        try {
            boolean res=true;
            for (File childFile : file.listFiles()) {
                if (childFile.isDirectory()) {
                    res &= deleteFolderRecursively(childFile);
                } else {
                    res &= childFile.delete();
                }
            }
            res &= file.delete();
            return res;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    private static boolean copyAssetFolder(AssetManager assetManager, String fromAssetPath, String toPath) {
        try {
            String[] files = assetManager.list(fromAssetPath);
            boolean res = true;

            if (files.length==0) {
                //If it's a file, it won't have any assets "inside" it.
                res &= copyAsset(assetManager,
                        fromAssetPath,
                        toPath);
            } else {
                new File(toPath).mkdirs();
                for (String file : files)
                res &= copyAssetFolder(assetManager,
                        fromAssetPath + "/" + file,
                        toPath + "/" + file);
            }
            return res;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    private static boolean copyAsset(AssetManager assetManager, String fromAssetPath, String toPath) {
        InputStream in = null;
        OutputStream out = null;
        try {
            in = assetManager.open(fromAssetPath);
            new File(toPath).createNewFile();
            out = new FileOutputStream(toPath);
            copyFile(in, out);
            in.close();
            in = null;
            out.flush();
            out.close();
            out = null;
            return true;
        } catch(Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    private static void copyFile(InputStream in, OutputStream out) throws IOException {
        byte[] buffer = new byte[1024];
        int read;
        while ((read = in.read(buffer)) != -1) {
            out.write(buffer, 0, read);
        }
    }
```

Before starting the node runtime, delete the previous `nodejs-project` and copy the current one into the `FilesDir` and start the runtime from there:
```java
            new Thread(new Runnable() {
                @Override
                public void run() {
                    //The path where we expect the node project to be at runtime.
                    String nodeDir=getApplicationContext().getFilesDir().getAbsolutePath()+"/nodejs-project";
                    //Recursively delete any existing nodejs-project.
                    File nodeDirReference=new File(nodeDir);
                    if (nodeDirReference.exists()) {
                        deleteFolderRecursively(new File(nodeDir));
                    }
                    //Copy the node project from assets into the application's data path.
                    copyAssetFolder(getApplicationContext().getAssets(), "nodejs-project", nodeDir);
                    startNodeWithArguments(new String[]{"node",
                            nodeDir+"/main.js"
                    });
                }
            }).start();
```

> Attention: Given the project folder can be overwritten, it should not be used for persistent data storage.

### Copy the `nodejs-project` only after an APK change

Recopying the `nodejs-project` at each Application's run can be expensive, so improve it by saving the last time the APK was updated on an Application Shared Preference and check if we need to delete and copy the `nodejs-project`.

Add the helper functions to `app/src/main/java/com/yourorg/sample/MainActivity.java`:
```java
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.SharedPreferences;

...

    private boolean wasAPKUpdated() {
        SharedPreferences prefs = getApplicationContext().getSharedPreferences("NODEJS_MOBILE_PREFS", Context.MODE_PRIVATE);
        long previousLastUpdateTime = prefs.getLong("NODEJS_MOBILE_APK_LastUpdateTime", 0);
        long lastUpdateTime = 1;
        try {
            PackageInfo packageInfo = getApplicationContext().getPackageManager().getPackageInfo(getApplicationContext().getPackageName(), 0);
            lastUpdateTime = packageInfo.lastUpdateTime;
        } catch (PackageManager.NameNotFoundException e) {
            e.printStackTrace();
        }
        return (lastUpdateTime != previousLastUpdateTime);
    }

    private void saveLastUpdateTime() {
        long lastUpdateTime = 1;
        try {
            PackageInfo packageInfo = getApplicationContext().getPackageManager().getPackageInfo(getApplicationContext().getPackageName(), 0);
            lastUpdateTime = packageInfo.lastUpdateTime;
        } catch (PackageManager.NameNotFoundException e) {
            e.printStackTrace();
        }
        SharedPreferences prefs = getApplicationContext().getSharedPreferences("NODEJS_MOBILE_PREFS", Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = prefs.edit();
        editor.putLong("NODEJS_MOBILE_APK_LastUpdateTime", lastUpdateTime);
        editor.commit();
    }
```

Change the code that starts the node runtime to check if it needs to delete the previous `nodejs-project` and copy the current one into the `FilesDir`:

```java
            new Thread(new Runnable() {
                @Override
                public void run() {
                    //The path where we expect the node project to be at runtime.
                    String nodeDir=getApplicationContext().getFilesDir().getAbsolutePath()+"/nodejs-project";
                    if (wasAPKUpdated()) {
                        //Recursively delete any existing nodejs-project.
                        File nodeDirReference=new File(nodeDir);
                        if (nodeDirReference.exists()) {
                            deleteFolderRecursively(new File(nodeDir));
                        }
                        //Copy the node project from assets into the application's data path.
                        copyAssetFolder(getApplicationContext().getAssets(), "nodejs-project", nodeDir);

                        saveLastUpdateTime();
                    }
                    startNodeWithArguments(new String[]{"node",
                            nodeDir+"/main.js"
                    });
                }
            }).start();
```

### Redirect the stdout and stderr to logcat

The Node.js runtime and the Node.js `console` module use the process' `stdout` and `stderr` streams. Some code is needed to redirect those streams to the Android system log, so they can be viewed with logcat.
This sample adds C++ code to manage the redirection by starting two background threads (one for `stdout` and the other for `stderr`), to provide a more pleasant Node.js debugging experience.

Add the helper functions to `app/src/main/cpp/native-lib.cpp`:
```cc
#include <pthread.h>
#include <unistd.h>
#include <android/log.h>

...

// Start threads to redirect stdout and stderr to logcat.
int pipe_stdout[2];
int pipe_stderr[2];
pthread_t thread_stdout;
pthread_t thread_stderr;
const char *ADBTAG = "NODEJS-MOBILE";

void *thread_stderr_func(void*) {
    ssize_t redirect_size;
    char buf[2048];
    while((redirect_size = read(pipe_stderr[0], buf, sizeof buf - 1)) > 0) {
        //__android_log will add a new line anyway.
        if(buf[redirect_size - 1] == '\n')
            --redirect_size;
        buf[redirect_size] = 0;
        __android_log_write(ANDROID_LOG_ERROR, ADBTAG, buf);
    }
    return 0;
}

void *thread_stdout_func(void*) {
    ssize_t redirect_size;
    char buf[2048];
    while((redirect_size = read(pipe_stdout[0], buf, sizeof buf - 1)) > 0) {
        //__android_log will add a new line anyway.
        if(buf[redirect_size - 1] == '\n')
            --redirect_size;
        buf[redirect_size] = 0;
        __android_log_write(ANDROID_LOG_INFO, ADBTAG, buf);
    }
    return 0;
}

int start_redirecting_stdout_stderr() {
    //set stdout as unbuffered.
    setvbuf(stdout, 0, _IONBF, 0);
    pipe(pipe_stdout);
    dup2(pipe_stdout[1], STDOUT_FILENO);

    //set stderr as unbuffered.
    setvbuf(stderr, 0, _IONBF, 0);
    pipe(pipe_stderr);
    dup2(pipe_stderr[1], STDERR_FILENO);

    if(pthread_create(&thread_stdout, 0, thread_stdout_func, 0) == -1)
        return -1;
    pthread_detach(thread_stdout);

    if(pthread_create(&thread_stderr, 0, thread_stderr_func, 0) == -1)
        return -1;
    pthread_detach(thread_stderr);

    return 0;
}
```

Start the redirection right begore starting the Node.js runtime:
```cc
    //Start threads to show stdout and stderr in logcat.
    if (start_redirecting_stdout_stderr()==-1) {
        __android_log_write(ANDROID_LOG_ERROR, ADBTAG, "Couldn't start redirecting stdout and stderr to logcat.");
    }

    //Start node, with argc and argv.
    return jint(node::Start(argument_count,argv));
```
