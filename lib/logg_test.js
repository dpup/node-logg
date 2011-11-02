
var logg = require('./logg');


exports.testGetLogger = function(test) {
  var first = logg.getLogger('first');
  var firstFoo = logg.getLogger('first.foo');
  var someOther = logg.getLogger('some.Other');
  
  test.strictEqual(first.getParent(), logg.rootLogger);
  test.strictEqual(firstFoo.getParent(), first);
  
  test.equals(someOther.getParent().name, 'some');
  test.done();
};

exports.testNothing = function(test) {
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
