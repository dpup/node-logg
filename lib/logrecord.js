
var util = require('util');

module.exports = LogRecord;


function LogRecord(level, name, args) {
  this.level = level;
  this.name = name;
  this.rawArgs = Array.prototype.splice.call(args, 1);
  this.date = new Date;
  this.message = this.rawArgs.map(function(a) {
    switch (typeof a) {
      case 'number':
      case 'string':
        return a;
      case 'boolean':
        return a ? 'true' : 'false';
      default:
        if (a instanceof Error) {
          return a.message + '\n' + a.stack;
        }
        return util.inspect(a);
    }
  }).join(' ');
}
