var path = require('path');
var fs = require('fs');

module.exports = function(context) {
  var xcode = context.requireCordovaModule('xcode');

  // Adds a custom function to remove script build phases, which is not supported on cordova's Xcode module yet.
  xcode.project.prototype.myRemovePbxScriptBuildPhase = function (buildPhaseName, target) {
    var buildPhaseTargetUuid = target || this.getFirstTarget().uuid;

    var buildPhaseUuid_comment = this.buildPhase(buildPhaseName, buildPhaseTargetUuid);
    if (!buildPhaseUuid_comment)
    {
      throw new Error("Couldn't find the build script phase to remove: " + buildPhaseName );
    }

    // Remove the '_comment' suffix to get the actual uuid.
    var buildPhaseUuid=buildPhaseUuid_comment.split('_')[0];

    // Remove from the pbxBuildPhaseObjects
    var pbxBuildPhaseObjects = this.getPBXObject('PBXShellScriptBuildPhase');
    if (pbxBuildPhaseObjects) {
      delete pbxBuildPhaseObjects[buildPhaseUuid];
      delete pbxBuildPhaseObjects[buildPhaseUuid_comment];
    }

    // Remove from the target's buildPhases
    var nativeTargets = this.pbxNativeTargetSection();
    var nativeTarget = nativeTargets[buildPhaseTargetUuid];
    var buildPhases = nativeTarget.buildPhases;
    for(var i in buildPhases)
    {
      var buildPhase = buildPhases[i];
      if (buildPhase.value == buildPhaseUuid) {
        buildPhases.splice(i, 1);
        break;
      }
    }
  };

  // Require the iOS platform Api to get the Xcode .pbxproj path.
  var iosPlatformPath = path.join(context.opts.projectRoot, 'platforms', 'ios');
  var iosAPI = require(path.join(iosPlatformPath, 'cordova', 'Api'));
  var iosAPIInstance = new iosAPI();
  var pbxprojPath = iosAPIInstance.locations.pbxproj;

  // Read the Xcode project and get the target.
  var xcodeProject = xcode.project(pbxprojPath);
  xcodeProject.parseSync();
  var firstTargetUUID = xcodeProject.getFirstTarget().uuid;

  // Removes the build phase to rebuild native modules.
  var rebuildNativeModulesBuildPhaseName = 'Build Node.js Mobile Native Modules';
  var rebuildNativeModulesBuildPhase = xcodeProject.buildPhaseObject('PBXShellScriptBuildPhase', rebuildNativeModulesBuildPhaseName, firstTargetUUID);
  if (rebuildNativeModulesBuildPhase) {
    xcodeProject.myRemovePbxScriptBuildPhase(rebuildNativeModulesBuildPhaseName, firstTargetUUID);
  }

  // Removes the build phase to sign native modules.
  var signNativeModulesBuildPhaseName = 'Sign Node.js Mobile Native Modules';
  var signNativeModulesBuildPhase = xcodeProject.buildPhaseObject('PBXShellScriptBuildPhase', signNativeModulesBuildPhaseName, firstTargetUUID);
  if (signNativeModulesBuildPhase) {
    xcodeProject.myRemovePbxScriptBuildPhase(signNativeModulesBuildPhaseName, firstTargetUUID);
  }

  // Write the changes into the Xcode project.
  fs.writeFileSync(pbxprojPath, xcodeProject.writeSync());

}
