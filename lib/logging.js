/**
 * @fileoverview Exposes the public interface to the logging tools.
 *
 * @author dan@pupi.us (Daniel Pupius)
 */

var sys = require('sys');
var Logger = require('./logger');


/**
 * The log levels.
 * @type {!Object}
 */
exports.Level = require('./level');


/**
 * Map of loggers.  Use a global so that it is shared if multiple copies of the
 * library are loaded, i.e. by using submodules or their own node_modules
 * package.  There's hopefully a better way to deal with this...
 * @type {!Object}
 */
if (typeof LOGGERS == 'undefined') {
  var isRoot = true;
  LOGGERS = {'': new Logger('')};
}


/**
 * Reference to the root loger.
 * @type {!Logger}
 */
var rootLogger = exports.rootLogger = LOGGERS[''];


/**
 * Returns the logger for the provided namespace, creating new instances as
 * necessary.
 * @param {string} ns The logger namespace, e.g. foo.bar.baz
 * @return {!Logger}
 */
var getLogger = exports.getLogger = function(ns) {
  if (!LOGGERS[ns]) {
    LOGGERS[ns] = new Logger(ns);
    LOGGERS[ns].setParent(getLogger(ns.substr(0, ns.lastIndexOf('.'))));
  }
  return LOGGERS[ns];
};


/**
 * Registers a watch function on the root logger.
 * @param {function(LogRecord)} watcher
 */
var registerWatcher = exports.registerWatcher = function(watcher) {
  rootLogger.registerWatcher(watcher);
};


if (isRoot) {
  // Register a default watcher that just logs to the console.
  registerWatcher(require('./consolewatcher'));
}