# Node-Logging

This is a logging library for use with [node.js](http://nodejs.org/).  It decouples log reporting from publishing and is based on the [Java API](http://download.oracle.com/javase/1.4.2/docs/api/java/util/logging/Logger.html).

## Installation

Fork the latest source from github.

## Usage

Call `getLogger(name)` with the name of your class, namespace, or made up identifier.

Loggers expose `fine()`, `info()`, `warn()`, `error()` and `log(level, args)`.

    var logging = require('logging');
    
    var logger = logging.getLogger('my.class);
    logger.setLogLevel(logging.Level.WARN);
    logger.info('This will not show up');
    logger.warn('But warnings will', new Error('aargg')); 

Loggers are arranged in a hierarchy based on their names, separated by `.`.  Log reporting levels are inherited based on the hierarchy, INFO being the default level.  For example, the following will silence everything but errors from within `subproject`:

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

A default watcher is included which outputs to the console.
