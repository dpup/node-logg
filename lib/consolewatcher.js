/**
 * @fileoverview A log watcher that simply logs to the console.
 *
 * @author dan@pupi.us (Daniel Pupius)
 */

var LogLevel = require('./level');


var consoleWatcher = module.exports = {};

/**
 * The watcher that will output to stdOut.
 *
 * @param {Object} logRecord The logRecord Object.
 */
consoleWatcher.watcher = function(logRecord) {
  process.stdout.write(consoleWatcher.formatRecord(logRecord), 'utf8');
};


/**
 * Format a logRecord for use on console printing.
 *
 * @param  {Object} logRecord The logRecord Object.
 * @param {boolean=} optStripColors do not use colors and formating.
 * @return {string} The log message formated.
 */
consoleWatcher.formatRecord = function(logRecord, optStripColors) {
  var color;
  if (logRecord.level >= LogLevel.SEVERE) {
    color = Colors.RED;
  } else if (logRecord.level >= LogLevel.WARN) {
    color = Colors.YELLOW;
  } else if (logRecord.level >= LogLevel.INFO) {
    color = Colors.RESET;
  } else {
    color = Colors.GREY;
  }

  var colReset = optStripColors ? '' : Colors.RESET;
  var colGrey = optStripColors ? '' : Colors.GREY;
  color = optStripColors ? '' : color;

  var msg = color + logRecord.message + colReset;
  var info = logRecord.meta ? (';' + logRecord.getFormattedMeta()) : ''

  var now = getDateString(logRecord.date);

  var out = colGrey + now + (logRecord.name ? ' [' +
      colReset + logRecord.name + colGrey + info + ']' : '') + ' : ' +
      colReset + msg;

  out += '\n';
  return out;
};

/**
 * Returns a date string in the form yy/mm/dd hh:mm:ss.mmm.
 * @param {Date} d Optional date object to use, other wise creates a new one.
 * @return {string}
 */
function getDateString(d) {
  d = d || new Date;
  return d.getFullYear() + '/' +
         pad(d.getMonth() + 1) + '/' +
         pad(d.getDate()) + ' ' +
         pad(d.getHours()) + ':' +
         pad(d.getMinutes()) + ':' +
         pad(d.getSeconds()) + '.' +
         pad(d.getMilliseconds(), 3);
}


/**
 * Pads a number with leading zeros to ensure it is at least opt_len long.
 * @param {number} n The number to pad.
 * @param {number} opt_num The desired length to pad too, defaults to 2.
 * @return {string}
 */
function pad(n, opt_len) {
  var len = opt_len || 2;
  n = String(n);
  return new Array(len - n.length + 1).join('0') + n;
}


/**
 * ANSI formatting codes.
 */
var Formatting = {
  BOLD_ON: '\x1B[1m',
  ITALICS_ON: '\x1B[3m',
  UNDERLINE_ON: '\x1B[4m',
  STRIKE_ON: '\x1B[9m',
  BOLD_OFF: '\x1B[22m',
  ITALICS_OFF: '\x1B[23m',
  UNDERLINE_OFF: '\x1B[24m',
  STRIKE_OFF: '\x1B[29m',
};


/**
 * ANSI color codes.
 */
var Colors = {
  RESET: '\x1B[0m',
  RED: '\x1B[31m',
  GREEN: '\x1B[32m',
  YELLOW: '\x1B[33m',
  BLUE: '\x1B[34m',
  MAGENTA: '\x1B[35m',
  CYAN: '\x1B[36m',
  GREY: '\x1B[37m'
};
