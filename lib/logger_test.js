
var Logger = require('./logger');
var LogLevel = require('./level');


exports.testDefaultLogLevel = function(test) {
  var logger = new Logger('test');
  test.ok(!logger.isLoggable(LogLevel.FINE), 'FINE should not be loggable');
  test.ok(logger.isLoggable(LogLevel.INFO), 'INFO should be loggable');
  test.ok(logger.isLoggable(LogLevel.WARN), 'WARN should be loggable');
  test.ok(logger.isLoggable(865), '865 should be loggable');
  test.done();
};


exports.testExplicitLogLevel = function(test) {
  var logger = new Logger('test');
  logger.setLogLevel(LogLevel.WARN);
  test.ok(!logger.isLoggable(LogLevel.INFO), 'INFO should not be loggable');
  test.ok(logger.isLoggable(LogLevel.WARN), 'WARN should be loggable');
  test.ok(logger.isLoggable(865), '865 should be loggable');
  test.done();
};


exports.testInheritedLogLevel = function(test) {
  var child = new Logger('child');
  var parent = new Logger('parent');
  var orphan = new Logger('orphan');
  child.setParent(parent);
  parent.setLogLevel(LogLevel.FINE);

  test.ok(child.isLoggable(LogLevel.FINE), 'FINE should be loggable for child');
  test.ok(parent.isLoggable(LogLevel.FINE), 'FINE should be loggable for parent');
  test.ok(!orphan.isLoggable(LogLevel.FINE), 'FINE should not be loggable for orphan');

  test.done();
};


exports.testWatchers = function(test) {
  var logger = new Logger('test');
  var parent = new Logger('parent');
  logger.setParent(parent);
  var records = [], parentRecords = [];
  logger.registerWatcher(function(logRecord) {
    records.push(logRecord);
  });
  parent.registerWatcher(function(logRecord) {
    parentRecords.push(logRecord);
  });

  logger.info('test');
  test.equal(1, records.length);
  test.equal(1, parentRecords.length);
  logger.info('test2');
  test.equal(2, records.length);
  test.equal(2, parentRecords.length);
  parent.info('parent');
  test.equal(2, records.length);
  test.equal(3, parentRecords.length);
  test.done();
};


exports.testLogRecord = function(test) {
  var logger = new Logger('test');
  var record = null;
  logger.registerWatcher(function(logRecord) {
    record = logRecord;
  });
  logger.warn('test', [1, 2, 3]);

  test.equal('test', record.name);
  test.equal(LogLevel.WARN, record.level);
  test.deepEqual(['test', [1, 2, 3]], record.rawArgs);
  test.equal('test [ 1, 2, 3 ]', record.message);

  test.done();
};


exports.testCloneWithNewMetadata = function(test) {
  var logger = new Logger('test').setMeta('extraField1', true);
  var newLogger = logger.clone().setMeta('extraField2', true);
  var record1 = null;
  var record2 = null;
  logger.registerWatcher(function(logRecord) {
    record1 = logRecord;
  });
  newLogger.registerWatcher(function(logRecord) {
    record2 = logRecord;
  });

  logger.warn('test');

  test.ok(record1.meta.extraField1);
  test.ok(!record1.meta.extraField2);

  newLogger.warn('test');

  test.ok(record2.meta.extraField1);
  test.ok(record2.meta.extraField2);

  test.done();
};
