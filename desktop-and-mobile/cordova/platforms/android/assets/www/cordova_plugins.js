cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
  {
    "id": "nodejs-mobile-cordova.nodejs",
    "file": "plugins/nodejs-mobile-cordova/www/nodejs_apis.js",
    "pluginId": "nodejs-mobile-cordova",
    "clobbers": [
      "nodejs"
    ]
  }
];
module.exports.metadata = 
// TOP OF METADATA
{
  "cordova-plugin-whitelist": "1.3.3",
  "nodejs-mobile-cordova": "0.1.4"
};
// BOTTOM OF METADATA
});