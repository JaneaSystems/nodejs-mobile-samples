# tar.gz
[![Coverage Status](https://coveralls.io/repos/alanhoff/node-tar.gz/badge.svg?branch=master)][0]
[![Travis](https://travis-ci.org/alanhoff/node-tar.gz.svg)][1]
[![Dependencies](https://david-dm.org/alanhoff/node-tar.gz.svg)][2]

Pure gzip tarball tools and sugar for Node.js

### API

* `createReadStream` reads a directory and returns a readable stream containing
a gzipped tarball.

```javascript
var fs = require('fs');
var targz = require('tar.gz');

// Create all streams that we need
var read = targz().createReadStream('/some/directory');
var write = fs.createWriteStream('compressed.tar.gz');

// Let the magic happen
read.pipe(write);
```

* `createWriteStream` writes the content from a tarball stream into some
directory.

```javascript
var request = require('request');
var targz = require('tar.gz');

// Streams
var read = request.get('https://nodejs.org/dist/v0.12.7/node-v0.12.7.tar.gz');
var write = targz().createWriteStream('/some/directory');

read.pipe(write);
```

* `createParseStream` reads a tarball stream and emits `entry` for every entry
parsed .

```javascript
var request = require('request');
var targz = require('tar.gz');

// Streams
var read = request.get('https://nodejs.org/dist/v0.12.7/node-v0.12.7.tar.gz');
var parse = targz().createParseStream();

parse.on('entry', function(entry){
  console.log(entry.path);
});

read.pipe(parse);
```

* `compress` compress one directory and saves the result to a tarball.

```javascript
// Using callbacks
targz().compress('/home/myuser', '/bkp/backup.tar.gz', function(err){
  if(err)
    console.log('Something is wrong ', err.stack);

  console.log('Job done!');
});

// Using promises
targz().compress('/home/myuser', '/bkp/backup.tar.gz')
  .then(function(){
    console.log('Job done!');
  })
  .catch(function(err){
    console.log('Something is wrong ', err.stack);
  });
```

* `extract` extracts a tarball into a directory.

```javascript
// Using callbacks
targz().extract('/bkp/backup.tar.gz', '/home/myuser', function(err){
  if(err)
    console.log('Something is wrong ', err.stack);

  console.log('Job done!');
});

// Using promises
targz().extract('/bkp/backup.tar.gz', '/home/myuser')
  .then(function(){
    console.log('Job done!');
  })
  .catch(function(err){
    console.log('Something is wrong ', err.stack);
  });
```

### Gzip options

You can pass any `zlib.createGzip` options to `tar.gz` constructor, like so:

```javascript
var tarball = new TarGz({
  level: 9, // Maximum compression
  memLevel: 9
});
```

### Tar options

You can pass any [tar](https://github.com/npm/node-tar#tarpackproperties) properties to `tar.gz` constructor in the second argument, like so:

```javascript
var tarball = new TarGz({}, {
  fromBase: true // do not include top level directory
});
```

### Command line

It's also possible to use `tar.gz` as a command line utility, you just need to
install it globally with `npm install -g tar.gz`. Here is the help command
output.

```
Usage: targz [options] [command]

Commands:

  extract|e <source> <target>             Extracts the source tarball into the target directory
  compress|c [options] <source> <target>  Compress the source directory into the target tarball
  list|l <source>                         List all paths inside the source tarball

Options:

  -h, --help     output usage information
  -V, --version  output the version number
```

### Testing

```bash
git clone git@github.com:alanhoff/node-tar.gz.git
cd node-tar.gz
npm install && npm test
```

### License (ISC)

```
Copyright (c) 2015-2016, Alan Hoffmeister <alanhoffmeister@gmail.com>

Permission to use, copy, modify, and distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
```

[0]: https://coveralls.io/github/alanhoff/node-tar.gz
[1]: https://travis-ci.org/alanhoff/node-tar.gz
[2]: https://david-dm.org/alanhoff/node-tar.gz
