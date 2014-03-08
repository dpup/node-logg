/**
 * @fileoverview Exposes the public interface to the logging tools.
 *
 * @author dan@pupi.us (Daniel Pupius)
 */

var util = require('util');
var Logger = require('./logger');
var consolewatcher = require('./consolewatcher');

/** @type {boolean} If this package is the root one */
var isRoot = false;

/** @type {boolean} If console watcher has been registered */
var isConsoleRegistered = false;

/**
 * Map of loggers.  Use a global so that it is shared if multiple copies of the
 * library are loaded, i.e. by using submodules or their own node_modules
 * package.  There's hopefully a better way to deal with this...
 * @type {!Object}
 */
if (typeof LOGGERS == 'undefined') {
  isRoot = true;
  LOGGERS = {'': Logger.getSingleton()};
  LOGGERS_AR = [Logger.getSingleton()];
}


/**
 * Reference to the root logger.
 * @type {!Logger}
 */
var rootLogger = LOGGERS[''];



/**
 * Returns the logger for the provided namespace, creating new instances as
 * necessary.
 * @param {string} ns The logger namespace, e.g. foo.bar.baz
 * @return {!Logger}
 */
function getLogger(ns) {
  if (!LOGGERS[ns]) {
    LOGGERS[ns] = new rootLogger.constructor(ns);
    LOGGERS[ns].setParent(getLogger(getParentNs(ns)));
    LOGGERS_AR.push(LOGGERS[ns]);
  }
  return LOGGERS[ns];
}


/**
 * Returns a new transient logger each time it is called.
 *
 * Transient loggers that will not be globally registered and can thus be garbage
 * collected when they go out of scope.  Unlike getLogger(), calling this method
 * twice will return two separate instances.  It can also not be used to control
 * log levels of child loggers.
 *
 * If parent loggers exist, they will be used, otherwise transient parents will
 * be created.  As such transient loggers can inherit log levels from the root
 * logger.
 *
 * @param {string} ns The logger namespace, e.g. foo.bar.baz
 * @return {!Logger}
 */
function getTransientLogger(ns) {
  var logger = new Logger(ns);
  var parent = getParentNs(ns);
  if (LOGGERS[parent]) logger.setParent(LOGGERS[parent])
  else logger.setParent(getTransientLogger(parent))
  return logger
}


/**
 * Registers a watch function on the root logger.
 * @param {function(LogRecord)} watcher
 */
function registerWatcher(watcher) {
  rootLogger.registerWatcher(watcher);
}


/**
 * Gets the parent namespace.
 * @param {string} ns The logger namespace, e.g. foo.bar.baz
 * @return {string} The parent's namespace, e.g. foo.bar
 */
function getParentNs(ns) {
  return ns.substr(0, ns.lastIndexOf('.'))
}

/**
 * Removes the console watcher, no more logging to the console.
 */
function removeConsole() {
  if (!isRoot) {
    throw new Error('This instance is not the main one. Another package uses a' +
      ' different version of "node-logg" and holds the actual reference to' +
      ' the console watcher');
  }

  if (!isConsoleRegistered) {
    return;
  }
  rootLogger.removeListener('', consolewatcher.watcher);
  isConsoleRegistered = false;
}


/**
 * Register a default watcher that just logs to the console.
 */
function addConsole() {
  if (!isRoot) {
    throw new Error('This instance is not the main one. Another package uses a' +
      ' different version of "node-logg" and holds the actual reference to' +
      ' the console watcher');
  }
  if (isConsoleRegistered) {
    return;
  }
  registerWatcher(consolewatcher.watcher);
  isConsoleRegistered = true;
}

/**
 * Removes all the listeners of all the logger instances including
 * the rootLogger.
 *
 */
function removeAllListeners() {
  LOGGERS_AR.forEach(function(logger){
    logger.removeAllListeners();
  });

  // restore console if it was registered
  if (isConsoleRegistered) {
    isConsoleRegistered = false;
    addConsole();
  }
}

if (isRoot) {
  addConsole();
}


module.exports = {
  Level: require('./level'),
  rootLogger: rootLogger,
  getLogger: getLogger,
  getTransientLogger: getTransientLogger,
  registerWatcher: registerWatcher,
  formatRecord: consolewatcher.formatRecord,
  addConsole: addConsole,
  removeConsole: removeConsole,
  removeListener: rootLogger.removeListener.bind(rootLogger),
  removeAllListeners: removeAllListeners,
  on: rootLogger.on.bind(rootLogger)
};

