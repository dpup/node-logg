
var util = require('util');

module.exports = LogRecord;


function LogRecord(level, name, args) {
  this.level = level;
  this.name = name;
  this.rawArgs = Array.prototype.splice.call(args, 1).map(cloneErrors);
  this.date = new Date;
  this.message = this.getFormattedMessage();
}


LogRecord.prototype.getFormattedMessage = function () {
  var args = this.rawArgs.map(function(a) {
    switch (typeof a) {
      case 'number':
      case 'string':
        return a;
      case 'boolean':
        return a ? 'true' : 'false';
      default:
        if (isError(a)) {
          return '[' + (a.name || 'ERROR') + (a.type ? ' ' + a.type : '') +
                 '] ' + a.message + '\n' + a.stack;
        }
        return util.inspect(a);
    }
  })

  // Handle %s subsitution in the first argument.  Any args that don't have a
  // corresponding %s will be appended to the end.
  if (typeof args[0] == 'string') {
    var msg = args.shift()
    return msg.replace(/%s/g, function () {
      return args.shift()
    }) + (args.length ? ' ' + args.join(' ') : '')
  } else {
    return args.join(' ')
  }
}


// Errors don't serialize well so we convert them to standard objects.
function cloneErrors(obj) {
  if (isError(obj)) {
    // Copy non-enumerable properties.
    var clone = {
      name: obj.name,
      type: obj.type,
      message: obj.message,
      stack: obj.stack
    }
    // Copy anything else that might have been added.
    for (var key in obj) {
      clone[key] = obj[key]
    }
    return clone
  } else {
    return obj
  }
}


// Special treatment for objects that may look like errors.
function isError(o) {
  return o && typeof o == 'object' && (o instanceof Error || o.message && o.stack)
}
