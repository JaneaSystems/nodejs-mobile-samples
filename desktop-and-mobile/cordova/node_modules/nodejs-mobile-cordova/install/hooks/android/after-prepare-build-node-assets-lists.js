var fs = require('fs');

const NODEJS_PROJECT_ROOT = 'www/nodejs-project';
const FILE_LIST_PATH = 'platforms/android/assets/file.list';
const DIR_LIST_PATH = 'platforms/android/assets/dir.list';

var fileList = [];
var dirList = [];

function enumFolder(folderPath) {
  var files = fs.readdirSync(folderPath);
  for (var i in files) {
    var name = files[i];
    var path = folderPath + '/' + files[i];
    if (fs.statSync(path).isDirectory()) {
      if (name.startsWith('.') === false) {
        dirList.push(path);
        enumFolder(path);
      }
    } else {
      if (name.startsWith('.') === false &&
          name.endsWith('.gz') === false &&
          name.endsWith('~') === false) {
        fileList.push(path);
      }
    }
  }
}

function createFileAndFolderLists(callback) {
  enumFolder(NODEJS_PROJECT_ROOT);
  try {
    fs.writeFileSync(FILE_LIST_PATH, fileList.join('\n')); 
    fs.writeFileSync(DIR_LIST_PATH, dirList.join('\n'));
  } catch (err) {
    console.log(err);
    callback(err);
    return;
  }
  callback(null);
}

module.exports = function(context) {
  var Q = context.requireCordovaModule('q');
  var deferral = new Q.defer();

  createFileAndFolderLists(function(err) {
    if (err) {
      deferral.reject(err);
    } else {
      deferral.resolve();
    }
  });

  return deferral.promise;
}
