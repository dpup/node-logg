/**
 * @fileoverview Class used by clients to create new log messages.
 *
 * @author dan@pupi.us (Daniel Pupius)
 */

module.exports = Logger;

var LogRecord = require('./logrecord');
var LogLevel = require('./level');



/**
 * @param {string} name The name for this logger, will get shown in the logs.
 * @constructor
 */
function Logger(name) {
  this.name = name;
  this.parent_ = null;
  this.watchers_ = [];
  this.logLevel_ = LogLevel.INHERIT;

  this.fine = this.log.bind(this, LogLevel.FINE);
  this.info = this.log.bind(this, LogLevel.INFO);
  this.warn = this.log.bind(this, LogLevel.WARN);
  this.error = this.log.bind(this, LogLevel.SEVERE);
}


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
  this.watchers_.push(watcher);
};


/**
 * Gets the array of watchers registered on this logger.
 * @return {Array.<function(LogRecord)>}
 */
Logger.prototype.getWatchers = function() {
  return this.watchers_;
};


/**
 * Logs at a specific level.
 * @param {LogLevel} level
 * @param {*...} var_args The items to log.
 */
Logger.prototype.log = function(level, var_args) {
  if (this.isLoggable(level)) {
    var logRecord = new LogRecord(level, this.name, arguments);
    var logger = this;
    while (logger) {
      logger.getWatchers().forEach(function(watcher) {
        watcher(logRecord);
      });
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
