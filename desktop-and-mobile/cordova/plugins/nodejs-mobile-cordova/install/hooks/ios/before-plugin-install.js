var fs = require('fs');
var targz2 = require('tar.gz2');

const nodeProjectFolder = 'www/nodejs-project';
const nodeMobileFolderPath = 'plugins/nodejs-mobile-cordova/libs/ios/nodemobile/';
const nodeMobileFileName = 'NodeMobile.framework';
const nodeMobileFilePath = nodeMobileFolderPath + nodeMobileFileName;
const zipFileName = nodeMobileFileName + '.tar.zip';
const zipFilePath = nodeMobileFolderPath + zipFileName

module.exports = function(context) {
  var Q = context.requireCordovaModule('q');
  var deferral = new Q.defer();
  
  // Create the node project folder if it doesn't exist
  if (!fs.existsSync(nodeProjectFolder)) {
    fs.mkdirSync(nodeProjectFolder);
  }

  // Unzip and untar the libnode.Framework
  if (fs.existsSync(zipFilePath)) {  
    targz2().extract(zipFilePath, nodeMobileFolderPath, function(err) {
      if (err) {
        deferral.reject(err);
      } else {
        fs.unlinkSync(zipFilePath);
        deferral.resolve();
      }
    });
  } else if (!fs.existsSync(nodeMobileFilePath)) {
    deferral.reject(new Error(nodeMobileFileName + ' is missing'));
  } else {
    deferral.resolve();
  }
  
  return deferral.promise;
}
