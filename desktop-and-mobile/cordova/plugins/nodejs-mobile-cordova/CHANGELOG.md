# Node.js for Mobile Apps Cordova plugin ChangeLog

<table>
<tr>
<th>Current</th>
</tr>
<tr>
<td>
<a href="#0.1.4">0.1.4</a><br/>
<a href="#0.1.3">0.1.3</a><br/>
<a href="#0.1.2">0.1.2</a><br/>
<a href="#0.1.1">0.1.1</a><br/>
</td>
</tr>
</table>

<a id="0.1.4"></a>
## Version 0.1.4 - Mar 07 2018

### Notable Changes
 - Hotfixes release.

### Commits
 - [[`c723064`](https://github.com/janeasystems/nodejs-mobile-cordova/commit/c7230644e2ba7f0a2bce139ee5ecf5f9b98c7c15)] - android: build node assets lists after prepare (Jaime Bernardo)
 - [[`22e5f9f`](https://github.com/janeasystems/nodejs-mobile-cordova/commit/22e5f9ff95d3b185f8ff747a490d0f0e2ad95838)] - android: remove version settings from gradle file (Jaime Bernardo)

<a id="0.1.3"></a>
## Version 0.1.3 - Mar 05 2018

### Notable Changes
 - Update `nodejs-mobile` binaries to `v0.1.4`.
 - Include experimental native modules build code.
 - Show stdout and stderr in Android logcat.
 - Include the nodejs-project in the runtime NODE_PATH when starting with script code.
 - Add async initialization on Android.
 - Increase the iOS node thread stack size to 1MB.

### Commits
 - [[`f53534f`](https://github.com/janeasystems/nodejs-mobile-cordova/commit/f53534fd56ff3f0d52c058428a7e910a626ffd8b)] - plugin: remove native modules detection (Jaime Bernardo)
 - [[`c4cd7ec`](https://github.com/janeasystems/nodejs-mobile-cordova/commit/c4cd7ec65cf68d3224ae9ddcb3246e988b1cbbc2)] - docs: rephrasing of some README.md sections (Jaime Bernardo)
 - [[`dd22c90`](https://github.com/janeasystems/nodejs-mobile-cordova/commit/dd22c901e718f8529ed32fcd4de0eecdda3c0d6d)] - bridge: emit message event inside a setImmediate (Jaime Bernardo)
 - [[`7ac8dd9`](https://github.com/janeasystems/nodejs-mobile-cordova/commit/7ac8dd9b01446d1bbfb2b76da8ecd3b7c502918a)] - ios: increase node's thread stack size to 1MB (Jaime Bernardo)
 - [[`a4f2984`](https://github.com/janeasystems/nodejs-mobile-cordova/commit/a4f29846abbdf065093d73ca0deee6824d003edd)] - docs: Add native modules instructions (Jaime Bernardo)
 - [[`a603da6`](https://github.com/janeasystems/nodejs-mobile-cordova/commit/a603da61900a1127b3c8729e4ae0bd71b760b40b)] - android: cache native modules override preference (Jaime Bernardo)
 - [[`7fec514`](https://github.com/janeasystems/nodejs-mobile-cordova/commit/7fec514c2eaadd292f71fb4a74b4885051b42523)] - android: use helper script to call npm on macOS (Jaime Bernardo)
 - [[`ff19463`](https://github.com/janeasystems/nodejs-mobile-cordova/commit/ff19463e25690c8385544fd74b938f99260f17b4)] - android: use gradle tasks inputs and output (Jaime Bernardo)
 - [[`534114b`](https://github.com/janeasystems/nodejs-mobile-cordova/commit/534114b5d07f85ed87887758e8cdd9a372e767a8)] - android: async initialization (Enrico Giordani)
 - [[`75c9ec0`](https://github.com/janeasystems/nodejs-mobile-cordova/commit/75c9ec0915b433daee061325467efb4718dd56df)] - docs: update README.md (Enrico Giordani)
 - [[`43be1e8`](https://github.com/janeasystems/nodejs-mobile-cordova/commit/43be1e8a37330b9109aee47897830e14644dc0b4)] - plugin: set NODE_PATH for 'nodejs.startWithScript' (Enrico Giordani)
 - [[`c159d1b`](https://github.com/janeasystems/nodejs-mobile-cordova/commit/c159d1bd1d7bb07d68f32aca4c2057b2b488617a)] - android: replace AndroidManifest.xml (Enrico Giordani)
 - [[`adbe081`](https://github.com/janeasystems/nodejs-mobile-cordova/commit/adbe081852b5a08aeb5b93044e8c9720313448f9)] - android: redirect stdout/stderr to logcat (Enrico Giordani)
 - [[`4e4d2ae`](https://github.com/janeasystems/nodejs-mobile-cordova/commit/4e4d2aee48765b9d8855ac5b8340ac119f807d7b)] - plugin: improve helper script shell compatibility (Jaime Bernardo)
 - [[`cafd06a`](https://github.com/janeasystems/nodejs-mobile-cordova/commit/cafd06a02b44d73fccc2b35b6f3b109df78b6d82)] - plugin: Build native modules automatically (Jaime Bernardo)
 - [[`488974d`](https://github.com/janeasystems/nodejs-mobile-cordova/commit/488974daef72f5fa4e5221c7b6fa09a18a3e120e)] - plugin: use nodejs-mobile-gyp for native modules (Jaime Bernardo)
 - [[`3041ede`](https://github.com/janeasystems/nodejs-mobile-cordova/commit/3041ede08ff8884c76e315f74a38f506070a159c)] - android: add 'include/' to native code includes (Jaime Bernardo)
 - [[`d134d6a`](https://github.com/janeasystems/nodejs-mobile-cordova/commit/d134d6a8b70ece2ef3667fe6932da4d5a8651b2c)] - plugin: patch node-pre-gyp module path variables (Jaime Bernardo)
 - [[`ce674b6`](https://github.com/janeasystems/nodejs-mobile-cordova/commit/ce674b63beaceb5a09d6b4d6c7a495519aeba7aa)] - ios: native modules support (Jaime Bernardo)
 - [[`88ef4d3`](https://github.com/janeasystems/nodejs-mobile-cordova/commit/88ef4d3989dcfbf86a4582681b12873299e11db9)] - android: native modules support (Jaime Bernardo)
 - [[`0855d43`](https://github.com/janeasystems/nodejs-mobile-cordova/commit/0855d434872eda07575d75d7c521b1a938632d3e)] - plugin: move native files inside package (Jaime Bernardo)
 - [[`e3635f3`](https://github.com/janeasystems/nodejs-mobile-cordova/commit/e3635f3c8ae78e71a43e56caff159466995f62a2)] - core: update nodejs-mobile v0.1.4 (Jaime Bernardo)

<a id="0.1.2"></a>
## Version 0.1.2 - Jan 02 2018

### Notable Changes
 - Update nodejs-mobile binaries to v0.1.3.
 - Improve Android assets copy.

### Commits
 - [[`0773a17`](https://github.com/janeasystems/nodejs-mobile-cordova/commit/0773a17bafe4c69862315a6561d89685d53b73e5)] - Android: optimized assets copy (Enrico Giordani)
 - [[`f75f65d`](https://github.com/janeasystems/nodejs-mobile-cordova/commit/f75f65d1ff859ac62881c232bb17a676db048bdd)] - Define strict mode in the nodejs api js (#2) (stoically)
 - [[`fabe4da`](https://github.com/janeasystems/nodejs-mobile-cordova/commit/fabe4da319e1ba85acfbc2bee3b781c7eedce685)] - Update calls to reflect changed API (Enrico Giordani)
 - [[`3091985`](https://github.com/janeasystems/nodejs-mobile-cordova/commit/3091985832cd82ef4d00a9e97df1ffa78ff8aa39)] - libs: update nodejs-mobile to v0.1.3 (Enrico Giordani)
 - [[`933b43e`](https://github.com/janeasystems/nodejs-mobile-cordova/commit/933b43e66e5f7c1d2ca8c8dd3fa1f27815d1f3be)] - Update package fields and plugin engines requirements. (Enrico Giordani)
 - [[`26a52e2`](https://github.com/janeasystems/nodejs-mobile-cordova/commit/26a52e291141d9eb51633917bf180f945561609f)] - Update README.md (Enrico Giordani)

<a id="0.1.1"></a>
## Version 0.1.1 - Oct 02 2017

### Commits
 - [[`3fa38e8`](https://github.com/janeasystems/nodejs-mobile-cordova/commit/3fa38e89dd96d32e0e6107bbe8ae96ef03a3528e)] - Initial commit (Enrico Giordani)
