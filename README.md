# Node-Logging

This is a logging library for use with [node.js](http://nodejs.org/).  It decouples log reporting from publishing and is based on the [Java API](http://download.oracle.com/javase/1.4.2/docs/api/java/util/logging/Logger.html).

## Installation

Fork the latest source from github.

or

`npm install logg`

## Usage

Call `getLogger(name)` with the name of your class, namespace, or made up identifier.

Loggers expose `fine()`, `info()`, `warn()`, `error()` and `log(level, args)`.  These logging methods take variable arguments and will call `sys.inspect` on any objects that are passed.  There is special handling for Error objects.

    var logging = require('logg');
    
    var logger = logging.getLogger('my.class);
    logger.setLogLevel(logging.Level.WARN);
    logger.info('This will not show up');
    logger.warn('But warnings will', new Error('aargg')); 

Loggers are arranged in a hierarchy based on their names, separated by dots.  Log reporting levels are inherited based on the hierarchy, INFO being the default level.  For example, the following will silence everything but errors within the `subproject` namespace:

    var a = logging.getLogger('project.subproject.foo');
    var b = logging.getLogger('project.subproject.bar');
    var c = logging.getLogger('project.subproject.baz');
    var d = logging.getLogger('project.subproject.bam');
    
    logging.getLogger('project.subproject').setLogLevel(logging.Level.SEVERE);

Every logger can have watchers associated with it, which will get called with a log record.  Usually you'd just want to attach to root logger.

    logging.registerWatcher(function(logRecord) {
      // Don't use sync API in real life...
      fs.writeFileSync('logs.log', JSON.stringify(logRecord) + '\n');
    });

A default watcher is automatically registered which outputs to the console.


## Licence

The MIT License (MIT)

Copyright (c) 2011 Daniel Pupius

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

