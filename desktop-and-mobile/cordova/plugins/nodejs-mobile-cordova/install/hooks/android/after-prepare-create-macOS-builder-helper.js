const fs = require('fs');
const path = require('path');

// Gets the platform's www path.
function getPlatformWWWPath(context, platform)
{
  var platformPath = path.join(context.opts.projectRoot, 'platforms', platform);
  var platformAPI = require(path.join(platformPath, 'cordova', 'Api'));
  var platformAPIInstance = new platformAPI();
  return platformAPIInstance.locations.www;
}

// Adds a helper script to run "npm rebuild" with the current PATH.
// This workaround is needed for Android Studio on macOS when it is not started
// from the command line, as npm probably won't be in the PATH at build time.
function buildMacOSHelperNpmBuildScript(context, platform)
{
  var wwwPath = getPlatformWWWPath(context, platform);
  var helperMacOSBuildScriptPath = path.join(wwwPath, 'build-native-modules-MacOS-helper-script.sh');
  fs.writeFileSync( helperMacOSBuildScriptPath,`#!/bin/bash
    export PATH=$PATH:${process.env.PATH}
    npm $@
  `, {"mode": 0o755}
  );
}

// Adds a file to save the contents of the NODEJS_MOBILE_BUILD_NATIVE_MODULES
// environment variable if it is set during the prepare step.
// This workaround is needed for Android Studio on macOS when it is not started
// from the command line, since environment variables set in the shell won't
// be available.
function saveBuildNativeModulesPreference(context, platform)
{
  var wwwPath = getPlatformWWWPath(context, platform);
  var saveBuildNativeModulesPreferencePath = path.join(wwwPath, 'NODEJS_MOBILE_BUILD_NATIVE_MODULES_VALUE.txt');
  if (process.env.NODEJS_MOBILE_BUILD_NATIVE_MODULES !== undefined) {
    fs.writeFileSync(saveBuildNativeModulesPreferencePath, process.env.NODEJS_MOBILE_BUILD_NATIVE_MODULES);
  }
}

module.exports = function(context)
{
  if (context.opts.platforms.indexOf('android') >= 0) {
    if (process.platform === 'darwin') {
      buildMacOSHelperNpmBuildScript(context, 'android');
    }
    saveBuildNativeModulesPreference(context, 'android');
  }
}
