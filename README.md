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

    var logger = logging.getLogger('my.class');
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

## API

### logg.getLogger(name)

* *name* **string** The logger's name using dot nottation.

Will create a new Logger instance and return it.

### logg.registerWatcher(callback)

* *callback* **Function(LogRecord)** The callback of the watcher.

Attach a listener on the root logger capturing all log messages. This is legacy and sugar for `logg.on('', callback)`.

Read about the callback's argument `LogRecord` in [logg.LogRecord](#logglogrecord).

### logg.on(eventType, callback)

* *eventType* **string** The event type.
* *callback* **Function(LogRecord)** The callback of the event.

Attach a listener for a specific logger. Read about the events emitted by logg in the [Events Emitted](#events-emitted) section.

Read about the callback's argument `LogRecord` in [logg.LogRecord](#logglogrecord).

### logg.removeListener(eventType, callback)

* *eventType* **string** The event type.
* *callback* **Function(LogRecord)** The callback of the event.

Remove a listener that was attached using the `on` method.

### logg.removeAllListeners()

Removes any listeners attached, including ones using the `registerWatcher` method.

### logg.removeConsole()

Stop logging to console. By default node-logg will log to the console.

### logg.addConsole()

Will start logging to the console.

### logg.formatRecord(logRecord, optStripColors)

* *logRecord* **logg.LogRecord** The log record Object.
* *optStripColors* **boolean** Optionally strip colors, default is `false`.

* *Returns* **string** Always string.

Create a pretty formated message from the log record provided. By default `formatRecord` will return a string containing special codes that color the content. If you want to get the plain text version set the `optStripColors` option to `true`.

### logg.LogRecord

The logg.LogRecord class is a single log item. It is provided to every log message listener. The properties of a `LogRecord` are:

* **level** *number* The Level of the message (e.g. `100`).
* **name** *string* The name of the logger emitting the message (e.g. `app.model.apples`).
* **rawArgs** *Array* An array containing all the arguments passed to the logger.
* **date** *Date* A Date Object.
* **message** *string* A concatenation of `rawArgs` with Objects and Arrays expanded.

### logg.Level

The default logging levels available by node-logg. `logg.Level` is an enumeration of numbers:

```js
logg.Level.SEVERE;  // 1000
logg.Level.WARN;    // 800
logg.Level.INFO;    // 600
logg.Level.FINE;    // 400
logg.Level.FINER;   // 200
logg.Level.FINEST;  // 100
```

## Events Emitted

node-logg emits three type of events. All events emitted contain one item, the [logg.LogRecord](#logglogrecord). The event types are:

### The rootLogger

Captures all messages on the root level that are loggable. The special *rootLogger* emits events using the `''` key (empty string).

```js
logg.on('', function(logRecord) { /* ... */});
```

You can configure the logging level by using the `setLogLevel` method of the root logger:

```js
logg.rootLogger.setLogLevel(logg.Level.INFO);
```

### The Loggers Events

Every logger will emit it's own event which will bubble up to the rootLogger. So if a logger is named `app.model.apple` three events will be emitted using these types:

1. `app.model.apple` first emitted event.
2. `app.model` second emitted event.
3. `app` third emitted event.

These type of events will be emitted irrespective of the logging level set.

### The Levels Events

All messages emit events with their [Level](#logglevel) as the event type. This in effect makes the event-type a number.

These type of events will be emitted irrespective of the logging level set.


## Examples

Set up the node-logg to save messages to syslog for use in production. In this example the [node-syslog](https://github.com/schamane/node-syslog#readme) package is used.

```js
var logg = require('logg');
var syslog = require('node-syslog');

// setup syslog
syslog.init('kickq', syslog.LOG_PID | syslog.LOG_ODELAY, syslog.LOG_LOCAL0);

// do not log to console.
logg.removeConsole();

// listen for log messages
logg.on('', function(logRecord) {

  // format the message
  var message = logg.formatRecord(logRecord, true);

  // relay to syslog using LOG_INFO for WARN and above messages
  // LOG_DEBUG for the test
  if (logg.Level.WARN <= logRecord.level) {
    syslog.log(syslog.LOG_INFO, message);
  } else {
    syslog.log(syslog.LOG_DEBUG, message);
  }
});
```

During development you may want to see all the messages of a specific logger:
```js
// this is a debug file...
var logg = require('logg');

// display messages to console
logg.addConsole();

// set logging level of "app.model.apple" to lowest.
logg.getLogger('app.model.apple').setLogLevel(logg.Level.FINEST);

```

## Licence

The MIT License (MIT)

Copyright (c) 2011 Daniel Pupius

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

