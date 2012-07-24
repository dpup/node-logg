/**
 * @fileoverview Enumeration of log levels.
 *
 * @author dan@pupi.us (Daniel Pupius)
 */

module.exports = {
  SEVERE: 1000,
  WARN: 800,
  INFO: 600,
  FINE: 400,
  FINER: 200,
  FINEST: 100,
  INHERIT: -1,
  toString: function (level) {
    switch (level) {
      case 1000: return 'severe';
      case 800: return 'warn';
      case 600: return 'info';
      case 400: return 'fine';
      case 200: return 'finer';
      case 100: return 'finest';
      default: return String(level)
    }
  }
};
