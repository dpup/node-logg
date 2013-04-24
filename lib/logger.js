/**
 * @fileoverview Class used by clients to create new log messages.
 *
 * @author dan@pupi.us (Daniel Pupius)
 */

module.exports = Logger;

var util = require('util');
var LogRecord = require('./logrecord');
var LogLevel = require('./level');

var EventEmitter = require('events').EventEmitter;

/**
 * @param {string} name The name for this logger, will get shown in the logs.
 * @extends {events.EventEmitter}
 * @constructor
 */
function Logger(name) {
  EventEmitter.call(this);

  this.name = name;
  this.parent_ = null;
  this.watchers_ = [];
  this.logLevel_ = LogLevel.INHERIT;

  this.finest = this.log.bind(this, LogLevel.FINEST);
  this.finer = this.log.bind(this, LogLevel.FINER);
  this.fine = this.log.bind(this, LogLevel.FINE);
  this.info = this.log.bind(this, LogLevel.INFO);
  this.warn = this.log.bind(this, LogLevel.WARN);
  this.error = this.log.bind(this, LogLevel.SEVERE);
}
util.inherits(Logger, EventEmitter);

/** @type {?Logger} The Logger singleton instance */
Logger._instance = null;

/**
 * Static function that returns a singleton instance of the
 * Logger class, effectively being the "rootLogger".
 *
 * @return {Logger} The rootLoger.
 */
Logger.getSingleton = function() {
  if (Logger._instance) {
    return Logger._instance;
  }

  return (Logger._instance = new Logger(''));
};

/**
 * Sets the explicit log level for this logger.
 * @param {LogLevel} level
 */
Logger.prototype.setLogLevel = function(level) {
  this.logLevel_ = level;
};


/**
 * Gets the explicit (not inherited) log level for this logger.
 * @return {LogLevel}
 */
Logger.prototype.getLogLevel = function() {
  return this.logLevel_;
};


/**
 * Sets the parent logger, used for hierarchical log levels.
 * @param {Logger} logger
 */
Logger.prototype.setParent = function(logger) {
  this.parent_ = logger;
};


/**
 * Returns the parent logger.
 * @return {Logger}
 */
Logger.prototype.getParent = function() {
  return this.parent_;
};


/**
 * Registers a log watchers on this logger.
 * @param {function(LogRecord)} watcher
 */
Logger.prototype.registerWatcher = function(watcher) {
  this.on('', watcher);
};

/**
 * Logs at a specific level.
 * @param {LogLevel} level
 * @param {*...} var_args The items to log.
 */
Logger.prototype.log = function(level, var_args) {
  var logRecord = new LogRecord(level, this.name, arguments);

  var rootLogger = Logger.getSingleton();
  //
  // Event emitting plan in sequence:
  //
  // * If message is loggable emit on global key from rootLogger.
  // * If not rootLogger emit LEVEL event on instance and bubble up to and
  //     including rootLogger.
  // * If not rootLogger emit Logger NAME event on instance and bubble up to and
  //     including rootLogger.
  //
  //
  if (this.isLoggable(level)) {
    rootLogger.emit('', logRecord);
  }

  if (this.name) {
    var name;
    var logger = this;
    rootLogger.emit(level, logRecord);
    while (rootLogger !== logger) {
      name = logger.name
      rootLogger.emit(name, logRecord);
      logger = logger.getParent();
    }
  }

};


/**
 * Returns whether the provided level will be logged by the logger.
 * @param {LogLeve} level The level to check.
 * @return {boolean} Whether the level is loggable.
 */
Logger.prototype.isLoggable = function(level) {
  var logger = this;
  while (logger) {
    var curLevel = logger.getLogLevel();
    if (curLevel != LogLevel.INHERIT) return curLevel <= level;
    logger = logger.getParent();
  }
  // Make info the default log level.
  return level >= LogLevel.INFO;
};
