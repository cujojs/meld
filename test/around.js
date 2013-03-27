(function(buster, meld) {
'use strict';

var assert, refute;

assert = buster.assert;
refute = buster.refute;

var arg = 'foo'; // const

// Test fixture
function Fixture() {
	this.val = 0;
}

Fixture.prototype = {
	method: function() {
		return (++this.val);
	}
};

buster.testCase('around', {
	'should proceed to original method': function() {
		var target = new Fixture();

		// Starting value
		assert.equals(0, target.val);

		meld.around(target, 'method', function aroundAdvice(joinpoint) {
			// this should be the advised object
			assert.equals(target, this);
			assert.equals(target, joinpoint.target);

			// arg should be the return value from the orig method
			assert.equals(1, joinpoint.args.length);
			assert.equals(arg, joinpoint.args[0]);

			// after function should be called (duh) after
			// the original, so val will have changed.
			assert.equals(0, this.val);

			var ret = joinpoint.proceed();

			assert.equals(1, ret);
			assert.equals(1, this.val);

			return ret;
		});

		var ret = target.method(arg);

		// after method call, val should have changed
		assert.equals(1, target.val);

		// Make sure the return value is preserved
		assert.equals(1, ret);
	},

	'should allow multiple calls to proceed()': function() {
		var target = new Fixture();

		meld.around(target, 'method', function aroundAdvice(joinpoint) {
			// Calling joinpoint.proceed() multiple times is allowed
			assert.same(0, joinpoint.proceedCount());
			refute.exception(joinpoint.proceed);
			assert.same(1, joinpoint.proceedCount());
			refute.exception(joinpoint.proceed);
			assert.same(2, joinpoint.proceedCount());
		});

		target.method(arg);
	},

	'should be invoked from most recently added to least recently added': function() {
		var inner, target;

		inner = this.spy();
		target = new Fixture();

		// Inner
		meld.around(target, 'method', function aroundAdviceInner(joinpoint) {
			inner();
			// This will proceed to the original method
			joinpoint.proceed();
		});

		// Outer
		meld.around(target, 'method', function aroundAdviceOuter(joinpoint) {
			refute.calledOnce(inner);
			// This will proceed to the inner around
			joinpoint.proceed();

			// Verify that the inner around around has been called
			assert.calledOnce(inner);
		});

		target.method(arg);

	},

	'should be able to modify arguments': function() {
		var target, spy;

		target = new Fixture();
		spy = target.method = this.spy();

		// Starting value
		assert.equals(0, target.val);

		meld.around(target, 'method', function aroundAdvice(joinpoint) {
			// arg should be the return value from the orig method
			assert.equals(1, joinpoint.args.length);
			assert.equals(arg, joinpoint.args[0]);

			// Modify the original args and pass them through to
			// the original func
			return joinpoint.proceed(1, 2, 3);
		});

		target.method(arg);

		// Make sure the return value is preserved, also based on the modified args
		assert.calledOnceWith(spy, 1, 2, 3);
	},

	'should be able to modify arguments using array': function() {
		var target, spy;

		target = new Fixture();
		spy = target.method = this.spy();

		// Starting value
		assert.equals(0, target.val);

		meld.around(target, 'method', function aroundAdvice(joinpoint) {
			// arg should be the return value from the orig method
			assert.equals(1, joinpoint.args.length);
			assert.equals(arg, joinpoint.args[0]);

			// Modify the original args and pass them through to
			// the original func
			return joinpoint.proceedApply([1, 2, 3]);
		});

		target.method(arg);

		// Make sure the return value is preserved, also based on the modified args
		assert.calledOnceWith(spy, 1, 2, 3);
	},

	'should be able to modify the return value': function() {
		var target = new Fixture();
		target.method = this.stub().returns(0);

		meld.around(target, 'method', function aroundAdvice(joinpoint) {
			joinpoint.proceed();
			return 1;
		});

		assert.equals(target.method(arg), 1);
	},

	'should be able to prevent original method': function() {
		var target, spy;

		target = new Fixture();
		spy = target.method = this.spy();

		meld.around(target, 'method', function aroundAdvice(/*joinpoint*/) {
			// Don't proceed to original method
			// joinpoint.proceed();
			return 1;
		});

		refute.called(spy);
	}
});

})(
	this.buster || require('buster'),
	this.meld || require('../meld')
);