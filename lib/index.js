/**
 * @fileoverview Exposes the public interface to the logging tools.
 *
 * @author dan@pupi.us (Daniel Pupius)
 */

var sys = require('sys');
var Logger = require('./logger');



/**
 * Map of loggers.
 * @type {!Object}
 */
var loggers = exports.loggers = {'': new Logger('')};


/**
 * Reference to the root loger.
 * @type {!Logger}
 */
var rootLogger = exports.rootLogger = loggers[''];


/**
 * Returns the logger for the provided namespace, creating new instances as
 * necessary.
 * @param {string} ns The logger namespace, e.g. foo.bar.baz
 * @return {!Logger}
 */
var getLogger = exports.getLogger = function(ns) {
  if (!loggers[ns]) {
    loggers[ns] = new Logger(ns);
    loggers[ns].setParent(getLogger(ns.substr(0, ns.lastIndexOf('.'))));
  }
  return loggers[ns];
};


/**
 * Registers a watch function on the root logger.
 * @param {function(LogRecord)} watcher
 */
var registerWatcher = exports.registerWatcher = function(watcher) {
  rootLogger.registerWatcher(watcher);
};


// Register a default watcher that just logs to the console.
registerWatcher(require('./consolewatcher'));
