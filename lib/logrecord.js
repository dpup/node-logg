
var util = require('util');
var stringify = require('json-stringify-safe')

module.exports = LogRecord;


function LogRecord(level, name, meta, args) {
  this.level = level;
  this.name = name;
  this.meta = meta;
  this.rawArgs = Array.prototype.splice.call(args, 1).map(cloneErrors);
  this.date = new Date;
  this.message = this.getFormattedMessage();
}


LogRecord.prototype.getFormattedMeta = function () {
  if (!this.meta) return ''
  var out = []
  for (var key in this.meta) {
    out.push(key + '=' + this.meta[key])
  }
  return out.join(',')
}

LogRecord.prototype.getDateString = function() {
  return this.date.getFullYear() + '/' +
         pad(this.date.getMonth() + 1) + '/' +
         pad(this.date.getDate()) + ' ' +
         pad(this.date.getHours()) + ':' +
         pad(this.date.getMinutes()) + ':' +
         pad(this.date.getSeconds()) + '.' +
         pad(this.date.getMilliseconds(), 3);
}

LogRecord.prototype.getFormattedMessageForLogFiles = function () {
    return formatMessage(this.rawArgs, true)
}

LogRecord.prototype.getFormattedMessage = function format () {
  return formatMessage(this.rawArgs, false)
}

function formatMessage (rawArgs, isMachineReadable) {
  var args = rawArgs.map(function(a) {
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
        return isMachineReadable ? stringify(a) : util.inspect(a)
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


// Special treatment for objects that may look like errors.
function isError(o) {
  return o && typeof o == 'object' && (o instanceof Error || o.message && o.stack)
}
