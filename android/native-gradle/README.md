# Native Gradle Sample

An Android Studio project that uses the [`Node.js on Mobile`]( https://github.com/janeasystems/nodejs-mobile) shared library.

The sample app runs the node.js engine in a background thread to start an HTTP server on port 3000 and return the `process.versions` value. The app's Main Activity UI has a button to query the server and show the server's response. Alternatively, it's also possible to access the server from a browser running on a different device connected to the same local network.

## How to run
 - Clone this project.
 - Download the Node.js on Mobile shared library from [here](https://github.com/janeasystems/nodejs-mobile/releases/download/nodejs-mobile-v0.1.3/nodejs-mobile-v0.1.3-android.zip).
 - Copy the `bin/` folder from inside the downloaded zip file to `app/libnode/bin` (There are `copy-libnode.so-here` files in each architecture's path for convenience). If it's been done correctly you'll end with the following paths for the binaries:
   - `app/libnode/bin/arm64-v8a/libnode.so`
   - `app/libnode/bin/armeabi-v7a/libnode.so`
   - `app/libnode/bin/x86/libnode.so`
   - `app/libnode/bin/x86_64/libnode.so`
 - In Android Studio import the `android/native-gradle/` gradle project. It will automatically check for dependencies and prompt you to install missing requirements (i.e. you may need to update the Android SDK build tools to the required version (25.0.3) and install CMake to compile the C++ file that bridges Java to the Node.js on Mobile library).
 - After the gradle build completes, run the app on a compatible device.


## How the sample was developed

### Create an Android Studio Project
Using the Android Studio's New Project wizard, create a new Project with the following settings, by the order the options appear in screens:
1. `Include C++ support` checked
1. Phone and Tablet with Minimum SDK to `API 21: Android 5.0 (Lollipop)`
1. Empty activity selected
1. Left the defaults, which were:
    - Activity Name: MainActivity
    - `Generate Layout File` checked
    - Layout Name: activity_main
    - `Backwards Compatibility (AppCompat)` checked
1. Left the defaults, which were:
    - C++ Standard: Toolchain Default
    - `Exceptions Support (-fexceptions)` checked off
    - `Runtime TYpe Information Support (-frtti)` checked off
1. Finish

### Copy libnode's header files

To access libnode's `Start()` entrypoint, the libnode's header files are required.

Create the `libnode/` folder inside the project's `app/` folder. Copy the `include/` folder from inside the [downloaded zip file](https://github.com/janeasystems/nodejs-mobile/releases/download/nodejs-mobile-v0.1.3/nodejs-mobile-v0.1.3-android.zip) to `app/libnode/include`. If it's been done correctly you'll end with the following path for the `node.h` header file:
 - `app/libnode/include/node/node.h`

In `app/CMakeLists.txt` add the following line to add libnode's header files to the CMake include paths:
```CMake
include_directories(libnode/include/node/)
```

### Add native JNI function to start node.js

Edit `app/src/main/cpp/native-lib.cpp` to add the required include files:
```cc
#include <jni.h>
#include <string>
#include <cstdlib>
#include "node.h"
```

Convert the existing `stringFromJNI` function into the `startNodeWithArguments` function, which takes a Java String array, converts it into a `libuv` friendly format and calls `node::Start`. The function's signature has to be adapted to the chosen organization/application name. Use the already existing `stringFromJNI` function as a guide. In this sample's case, it meant changing from:

```cc
extern "C"
JNIEXPORT jstring JNICALL
Java_com_yourorg_sample_MainActivity_stringFromJNI(
        JNIEnv *env,
        jobject /* this */)
```

to:

```cc
extern "C" jint JNICALL
Java_com_yourorg_sample_MainActivity_startNodeWithArguments(
        JNIEnv *env,
        jobject /* this */,
        jobjectArray arguments)
``` 

The final `native-lib.cpp` looks like this:

```cc
#include <jni.h>
#include <string>
#include <cstdlib>
#include "node.h"

//node's libUV requires all arguments being on contiguous memory.
extern "C" jint JNICALL
Java_com_yourorg_sample_MainActivity_startNodeWithArguments(
        JNIEnv *env,
        jobject /* this */,
        jobjectArray arguments) {

    //argc
    jsize argument_count = env->GetArrayLength(arguments);

    //Compute byte size need for all arguments in contiguous memory.
    int c_arguments_size = 0;
    for (int i = 0; i < argument_count ; i++) {
        c_arguments_size += strlen(env->GetStringUTFChars((jstring)env->GetObjectArrayElement(arguments, i), 0));
        c_arguments_size++; // for '\0'
    }

    //Stores arguments in contiguous memory.
    char* args_buffer=(char*)calloc(c_arguments_size, sizeof(char));

    //argv to pass into node.
    char* argv[argument_count];

    //To iterate through the expected start position of each argument in args_buffer.
    char* current_args_position=args_buffer;

    //Populate the args_buffer and argv.
    for (int i = 0; i < argument_count ; i++)
    {
        const char* current_argument = env->GetStringUTFChars((jstring)env->GetObjectArrayElement(arguments, i), 0);

        //Copy current argument to its expected position in args_buffer
        strncpy(current_args_position, current_argument, strlen(current_argument));

        //Save current argument start position in argv
        argv[i] = current_args_position;

        //Increment to the next argument's expected position.
        current_args_position += strlen(current_args_position)+1;
    }

    //Start node, with argc and argv.
    return jint(node::Start(argument_count,argv));

}
```

### Call `startNodeWithArguments` from Java

Inside the application's main file `MainActivity.java` various changes are required.

#### Load libnode.so:

Instruct Java to load the `libnode.so` library by adding `System.loadLibrary("node");` to `MainActivity.java` after `System.loadLibrary("native-lib");`.

```java
public class MainActivity extends AppCompatActivity {

    static {
        System.loadLibrary("native-lib");
        System.loadLibrary("node");
    }
```

The prefix `lib` and the suffix `.so` in `libnode.so` are omitted.

#### Remove references to `stringFromJNI`:

Remove the references to the native function, that was replaced in `native-lib.cpp`, by deleting the following snippets:

```java
        // Example of a call to a native method
        TextView tv = (TextView) findViewById(R.id.sample_text);
        tv.setText(stringFromJNI());
```

```java
    /**
     * A native method that is implemented by the 'native-lib' native library,
     * which is packaged with this application.
     */
    public native String stringFromJNI();
```

#### Start a background thread to run `startNodeWithArguments`:

The app uses a background thread to run the Node.js engine and it supports to run only one instance of it.  
The node code is a simple HTTP server on port 3000 that returns `process.versions`. For simplicity, the node code is embedded in the `MainActivity.java` file:
```js
var http = require('http');
var versions_server = http.createServer( (request, response) => {
  response.end('Versions: ' + JSON.stringify(process.versions));
});
versions_server.listen(3000);
```

Add a reference to the `startNodeWithArguments` function, the Java signature is `public native Integer startNodeWithArguments(String[] arguments);`.

The `MainActivity` class looks like this at this point:

```java
public class MainActivity extends AppCompatActivity {

    // Used to load the 'native-lib' library on application startup.
    static {
        System.loadLibrary("native-lib");
        System.loadLibrary("node");
    }

    //We just want one instance of node running in the background.
    public static boolean _startedNodeAlready=false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        if( !_startedNodeAlready ) {
            _startedNodeAlready=true;
            new Thread(new Runnable() {
                @Override
                public void run() {
                    startNodeWithArguments(new String[]{"node", "-e",
                            "var http = require('http'); " +
                                    "var versions_server = http.createServer( (request, response) => { " +
                                    "  response.end('Versions: ' + JSON.stringify(process.versions)); " +
                                    "}); " +
                                    "versions_server.listen(3000);"
                    });
                }
            }).start();
        }
    }

    /**
     * A native method that is implemented by the 'native-lib' native library,
     * which is packaged with this application.
     */
    public native Integer startNodeWithArguments(String[] arguments);
}
```

### Add internet permissions to Manifest

Since the app runs an HTTP server, it requires the right permissions in `app/src/main/AndroidManifest.xml`. Add the following line under the `<manifest>` tag:
```
    <uses-permission android:name="android.permission.INTERNET"/>
```

### Add `libnode.so` to the build process

#### Copy the `libnode.so` binaries to the project structure:

Copy the `bin/` folder from inside the [downloaded zip file](https://github.com/janeasystems/nodejs-mobile/releases/download/nodejs-mobile-v0.1.3/nodejs-mobile-v0.1.3-android.zip) to `app/libnode/bin`. If it's been done correctly you'll end with the following paths for the binaries:
 - `app/libnode/bin/arm64-v8a/libnode.so`
 - `app/libnode/bin/armeabi-v7a/libnode.so`
 - `app/libnode/bin/x86/libnode.so`
 - `app/libnode/bin/x86_64/libnode.so`

#### Configure CMake and link Library:

In `app/CMakeLists.txt` specify the native shared library to import and its location:

```CMake
add_library( libnode
             SHARED
             IMPORTED )
set_target_properties( # Specifies the target library.
                       libnode
                       # Specifies the parameter you want to define.
                       PROPERTIES IMPORTED_LOCATION
                       # Provides the path to the library you want to import.
                       ${CMAKE_SOURCE_DIR}/libnode/bin/${ANDROID_ABI}/libnode.so )
```

Add `libnode` to the already existing `target_link_libraries`:
```CMake
target_link_libraries( # Specifies the target library.
                       native-lib
                       # Links imported library.
                       libnode
                       # Links the target library to the log library
                       # included in the NDK.
                       ${log-lib} )
```

#### Configure the app's gradle settings:

In `app/build.gradle`, some changes have to be made to correctly build and package the application.

We have to instruct gradle to only package native code for the supported architectures, by adding an `ndk` clause inside `defaultConfig`:
```groovy
        ndk {
            abiFilters "armeabi-v7a", "x86", "arm64-v8a", "x86_64"
        }
```

The shared library was built using the `libC++` STL, therefore the `ANDROID_STL=c++_shared` definition has to be passed inside the cmake clause in `defaultConfig` with `arguments "-DANDROID_STL=c++_shared"`:

```groovy
    defaultConfig {
        applicationId "com.yourorg.sample"
        minSdkVersion 21
        targetSdkVersion 25
        versionCode 1
        versionName "1.0"
        testInstrumentationRunner "android.support.test.runner.AndroidJUnitRunner"
        externalNativeBuild {
            cmake {
                cppFlags ""
                arguments "-DANDROID_STL=c++_shared"
            }
        }
        ndk {
            abiFilters "armeabi-v7a", "x86", "arm64-v8a", "x86_64"
        }
    }
```

Configure gradle to override its default `sourceSets` to include the libnode.so folder path, in the `android` section:

```groovy
android {

...

    // If you want Gradle to package prebuilt native libraries
    // with your APK, modify the default source set configuration
    // to include the directory of your prebuilt .so files as follows.
    sourceSets {
        main {
            jniLibs.srcDirs 'libnode/bin/'
        }
    }

...

}
```

### Add simple UI to test

At this point, it's already possible to run the app on an Android device and access the HTTP server from any device connected to the same local network. If the Android device's IP is `192.168.1.100` point the browser at `http://192.168.1.100:3000/`.

However, the sample also comes with the UI to query the local HTTP server and show the response.

#### Create a Button and TextView:

Edit the `activity_main.xml` ( `app/src/main/res/layout/activity_main.xml` ) in Android Studio, delete the existing `TextView` and add a `Button` with id `btVersions` and a `TextView` with id `tvVersions`

#### Add Button event to access the HTTP server:

In `MainActivity.java`, create an event to connect to the HTTP server when tapping the `Button` and place the resulting response in the `TextView`. Start by adding the required `import statements`:
```java
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.os.AsyncTask;
import java.net.*;
import java.io.*;
```

Next, create the `Button` event in `MainActivity`'s `onCreate` function, after the Node.js thread's initialization.

```java
    @Override
    protected void onCreate(Bundle savedInstanceState) {

...
    
        final Button buttonVersions = (Button) findViewById(R.id.btVersions);
        final TextView textViewVersions = (TextView) findViewById(R.id.tvVersions);

        buttonVersions.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {

                //Network operations should be done in the background.
                new AsyncTask<Void,Void,String>() {
                    @Override
                    protected String doInBackground(Void... params) {
                        String nodeResponse="";
                        try {
                            URL localNodeServer = new URL("http://localhost:3000/");
                            BufferedReader in = new BufferedReader(
                                    new InputStreamReader(localNodeServer.openStream()));
                            String inputLine;
                            while ((inputLine = in.readLine()) != null)
                                nodeResponse=nodeResponse+inputLine;
                            in.close();
                        } catch (Exception ex) {
                            nodeResponse=ex.toString();
                        }
                        return nodeResponse;
                    }
                    @Override
                    protected void onPostExecute(String result) {
                        textViewVersions.setText(result);
                    }
                }.execute();

            }
        });
    }
```

Tapping the UI's `Button`, runs an asynchronously call to the local Node.js's HTTP server and shows the resulting response in the `TextView`.

