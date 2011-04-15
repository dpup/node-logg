
var logging = require('./');


exports.testGetLogger = function(test) {
  var first = logging.getLogger('first');
  var firstFoo = logging.getLogger('first.foo');
  var someOther = logging.getLogger('some.Other');
  
  test.strictEqual(first.getParent(), logging.rootLogger);
  test.strictEqual(firstFoo.getParent(), first);
  
  test.equals(someOther.getParent().name, 'some');
  test.done();
};

exports.testNothing = function(test) {
  // Just log stuff to the console.
  var first = logging.getLogger('first');
  var firstFoo = logging.getLogger('first.foo');

  first.setLogLevel(0);
  
  firstFoo.error('This is severe!!!');
  firstFoo.warn('This is a warning');
  first.info('This is an info');
  first.fine('Everything is fine fine fine');
  
  test.done();  
};
