(function(buster, meld) {
'use strict';

var assert, refute, fail;

assert = buster.assert;
refute = buster.refute;
fail = buster.assertions.fail;

var arg = 'foo'; // const

// Test fixture
function Fixture() {
	this.val = 0;
}

Fixture.prototype = {
	method: function() {
		this.val++;
		return this.val;
	}
};

buster.testCase('afterReturning', {
	'should invoke advice after advised method returns': function() {
		var target = new Fixture();

		// Starting value
		assert.equals(0, target.val);

		meld.afterReturning(target, 'method', function afterAdvice(a) {
			// this should be the advised object
			assert.equals(target, this);

			// arg should be the return value from the orig method
			assert.equals(this.val, a);

			// after function should be called (duh) after
			// the original, so val will have changed.
			assert.equals(1, this.val);
		});

		var ret = target.method(arg);

		// after method call, val should have changed
		assert.equals(1, target.val);

		// Make sure the return value is preserved
		assert.equals(ret, target.val);

	},

	'should invoke most recently added advices last': function() {

		var target = new Fixture();
		var count = 0;

		// Add 3 advices and test their invocation order,
		// args, and return value

		// Starting value
		assert.equals(0, target.val);

		meld.afterReturning(target, 'method', function afterReturning0(a) {
			// this should be the advised object
			assert.equals(target, this);

			// arg should be the return value from the orig method
			assert.equals(this.val, a);

			// after function should be called (duh) after
			// the original, so val will have changed.
			assert.equals(1, this.val);

			// after* advice is stacked left to right such that advice added
			// later is called later, so count should not have
			// been incremented yet.
			assert.equals(0, count);

			// Increment count so it can be verified in next advice
			count++;
		});

		meld.afterReturning(target, 'method', function afterReturning1(a) {
			// this should be the advised object
			assert.equals(target, this);

			// arg should be the return value from the orig method
			assert.equals(this.val, a);

			// after function should be called (duh) after
			// the original, so val will have changed.
			assert.equals(1, this.val);

			assert.equals(1, count);

			// Increment count so it can be verified in next advice
			count++;
		});

		meld.afterReturning(target, 'method', function afterReturning2(a) {
			// this should be the advised object
			assert.equals(target, this);

			// arg should be the return value from the orig method
			assert.equals(this.val, a);

			// after function should be called (duh) after
			// the original, so val will have changed.
			assert.equals(1, this.val);

			assert.equals(2, count);
		});

		var ret = target.method(arg);

		// original method should only have been called once, so
		// val should only be 1.
		assert.equals(1, target.val);

		// Make sure the return value is preserved
		assert.equals(ret, target.val);
	},

	'should not be invoked when original method throws': function() {
		var target, spy;

		target = new Fixture();
		target.method = this.stub().throws(new Error());

		spy = this.spy();

		meld.afterReturning(target, 'method', spy);

		assert.exception(function() {
			target.method(arg);
		});

		// afterReturning advice should not have been called
		refute.called(spy);
	}
});

})(
	this.buster || require('buster'),
	this.meld || require('../meld')
);