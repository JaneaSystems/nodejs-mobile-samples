"use strict";

var gulp = require('gulp'),
    livereload = require('gulp-livereload'),
    browserSync = require('browser-sync').create(),
    path = require('path'),
    nodemon = require('nodemon'),
    del = require('del');

var client = {
    cordova: './cordova/',
    dist: './cordova/ExampleCordovaAngular/www/',
    src:  './src/client/**/*'
};

var server = {
    dist: './cordova/ExampleCordovaAngular/www/nodejs-project/',
    src:  './src/server/**/*'
};

var deps = {
    bower: './src/client/bower_components/**/*',
    node:  './src/server/node_modules/**/*',
    root:  './node_modules/**/*',
    rootb: './node_modules/.bin'
};

var binaries = {
    dist: server.dist + 'node_modules/uws/build/'
};

gulp.task('clean', function (cb) {
    return del([client.dist + '**/*'], {force: true}, cb);
});

gulp.task('clean:dev', function (cb) {
    return del([deps.bower, deps.node, deps.root, deps.rootb], {force: true}, cb);
});

gulp.task('clean:cordova', function (cb) {
    return del([client.cordova], {force: true}, cb);
});

gulp.task('remove-binaries', ['build-server'], function (cb) {
    return del([binaries.dist + '**/*'], {force: true}, cb);
});

gulp.task('build-client', ['clean'], function () {
    return gulp.src(client.src).pipe(gulp.dest(client.dist));
});

gulp.task('build-server', ['clean'], function () {
    return gulp.src(server.src).pipe(gulp.dest(server.dist));
});

gulp.task('build', ['clean', 'build-client', 'build-server', 'remove-binaries']);

gulp.task('default', ['build']);

var nodeApp     = path.join(__dirname, 'src', 'server', 'main.js');
var staticDir   = path.join(__dirname, 'src', 'client');
var defaultPort = 3001;

gulp.task('serve:sync', function() {
    var tasks = ['sync-build'];
    
    browserSync.init({
      port: defaultPort,
      server: {
          baseDir: staticDir
      }
    });
    
    livereload.listen();
    gulp.watch(client.src, tasks);

    startSeparateServer();
});

gulp.task('sync-build', function() {
    browserSync.reload();
});

function startSeparateServer() {
    nodemon({
      script: nodeApp,
      execMap: {
          js: 'node'
      },
      watch: [
          path.join(__dirname, 'src', 'server')
      ]
  });
}