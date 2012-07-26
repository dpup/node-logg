
var logg = require('./logg');


exports.testGetLogger = function (test) {
  var first = logg.getLogger('first');
  var firstFoo = logg.getLogger('first.foo');
  var someOther = logg.getLogger('some.Other');

  test.strictEqual(first.getParent(), logg.rootLogger);
  test.strictEqual(firstFoo.getParent(), first);

  test.equals(someOther.getParent().name, 'some');
  test.done();
};

exports.testNothing = function (test) {
  // Just log stuff to the console.
  var first = logg.getLogger('first');
  var firstFoo = logg.getLogger('first.foo');

  first.setLogLevel(0);

  firstFoo.error('This is severe!!!');
  firstFoo.warn('This is a warning');
  first.info('This is an info');
  first.fine('Everything is fine fine fine');

  test.done();
};

exports.testTransientLogger = function (test) {
  var foo = logg.getLogger('foo')
  var first = logg.getTransientLogger('foo.bar');
  var second = logg.getTransientLogger('foo.bar');
  test.notStrictEqual(first, second, 'Instance should be different.');
  test.strictEqual(first.getParent(), foo, 'Parent should be foo')
  test.strictEqual(first.getParent(), second.getParent(), 'Parents should be the same')

  var third = logg.getLogger('foo.bar')
  test.notStrictEqual(first, third, 'Instance should be different.');

  first.info('Testing transient')
  second.info('Testing another transient')
  third.info('Testing standard')

  test.done()
};
