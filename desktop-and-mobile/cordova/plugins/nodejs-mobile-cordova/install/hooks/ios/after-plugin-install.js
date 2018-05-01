var path = require('path');
var fs = require('fs');

module.exports = function(context) {
  var xcode = context.requireCordovaModule('xcode');

  // Require the iOS platform Api to get the Xcode .pbxproj path.
  var iosPlatformPath = path.join(context.opts.projectRoot, 'platforms', 'ios');
  var iosAPI = require(path.join(iosPlatformPath, 'cordova', 'Api'));
  var iosAPIInstance = new iosAPI();
  var pbxprojPath = iosAPIInstance.locations.pbxproj;

  // Read the Xcode project and get the target.
  var xcodeProject = xcode.project(pbxprojPath);
  xcodeProject.parseSync();
  var firstTargetUUID = xcodeProject.getFirstTarget().uuid;

  // Adds a build phase to rebuild native modules.
  var rebuildNativeModulesBuildPhaseName = 'Build Node.js Mobile Native Modules';
  var rebuildNativeModulesBuildPhaseScript = `
set -e
if [ -z "$NODEJS_MOBILE_BUILD_NATIVE_MODULES" ]; then
  NODEJS_MOBILE_BUILD_NATIVE_MODULES=0
fi
if [ "1" != "$NODEJS_MOBILE_BUILD_NATIVE_MODULES" ]; then exit 0; fi
# Get the nodejs-mobile-gyp location
NODEJS_MOBILE_GYP_DIR="$( cd "$PROJECT_DIR" && cd ../../plugins/nodejs-mobile-cordova/node_modules/nodejs-mobile-gyp/ && pwd )"
NODEJS_MOBILE_GYP_BIN_FILE="$NODEJS_MOBILE_GYP_DIR"/bin/node-gyp.js
# Rebuild modules with right environment
NODEJS_HEADERS_DIR="$( cd "$( dirname "$PRODUCT_SETTINGS_PATH" )" && cd Plugins/nodejs-mobile-cordova/ && pwd )"
pushd $CODESIGNING_FOLDER_PATH/www/nodejs-project/
if [ "$PLATFORM_NAME" == "iphoneos" ]
then
GYP_DEFINES="OS=ios" npm_config_nodedir="$NODEJS_HEADERS_DIR" npm_config_node_gyp="$NODEJS_MOBILE_GYP_BIN_FILE" npm_config_platform="ios" npm_config_node_engine="chakracore" npm_config_arch="arm64" npm --verbose rebuild --build-from-source
else
GYP_DEFINES="OS=ios" npm_config_nodedir="$NODEJS_HEADERS_DIR" npm_config_node_gyp="$NODEJS_MOBILE_GYP_BIN_FILE" npm_config_platform="ios" npm_config_node_engine="chakracore" npm_config_arch="x64" npm --verbose rebuild --build-from-source
fi
popd
`
  var rebuildNativeModulesBuildPhase = xcodeProject.buildPhaseObject('PBXShellScriptBuildPhase', rebuildNativeModulesBuildPhaseName, firstTargetUUID);
  if (!(rebuildNativeModulesBuildPhase)) {
    xcodeProject.addBuildPhase(
      [],
      'PBXShellScriptBuildPhase',
      rebuildNativeModulesBuildPhaseName,
      firstTargetUUID,
      { shellPath: '/bin/sh', shellScript: rebuildNativeModulesBuildPhaseScript }
    );
  }

  // Adds a build phase to sign native modules.
  var signNativeModulesBuildPhaseName = 'Sign Node.js Mobile Native Modules';
  var signNativeModulesBuildPhaseScript = `
set -e
if [ -z "$NODEJS_MOBILE_BUILD_NATIVE_MODULES" ]; then
  NODEJS_MOBILE_BUILD_NATIVE_MODULES=0
fi
if [ "1" != "$NODEJS_MOBILE_BUILD_NATIVE_MODULES" ]; then exit 0; fi
/usr/bin/codesign --force --sign $EXPANDED_CODE_SIGN_IDENTITY --preserve-metadata=identifier,entitlements,flags --timestamp=none $(find "$CODESIGNING_FOLDER_PATH/www/nodejs-project/" -type f -name "*.node")
`
  var signNativeModulesBuildPhase = xcodeProject.buildPhaseObject('PBXShellScriptBuildPhase', signNativeModulesBuildPhaseName, firstTargetUUID);
  if (!(signNativeModulesBuildPhase)) {
    xcodeProject.addBuildPhase(
      [],
      'PBXShellScriptBuildPhase',
      signNativeModulesBuildPhaseName,
      firstTargetUUID,
      { shellPath: '/bin/sh', shellScript: signNativeModulesBuildPhaseScript }
    );
  }

  // Write the changes into the Xcode project.
  fs.writeFileSync(pbxprojPath, xcodeProject.writeSync());

}
