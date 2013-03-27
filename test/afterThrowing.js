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
		throw new Error('testing afterThrowing');
	}
};

buster.testCase('afterThrowing', {
	'should invoke advice after advised method throws': function() {
		var target = new Fixture();

		// Starting value
		assert.equals(0, target.val);

		meld.afterThrowing(target, 'method', function afterReturning1(a) {
			// this should be the advised object
			assert.equals(target, this);

			// arg should be the exception that was thrown
			assert(a instanceof Error);

			// after function should be called (duh) after
			// the original, so val will have changed.
			assert.equals(1, this.val);
		});

		assert.exception(function() {
			target.method(arg);
		});

		// after method call, val should have changed
		assert.equals(1, target.val);
	},

	'should invoke most recently added advices last': function() {
		var target = new Fixture();
		var count = 0;

		// Add 3 advices and test their invocation order,
		// args, and return value

		// Starting value
		assert.equals(0, target.val);

		meld.afterThrowing(target, 'method', function afterReturning0(a) {
			// this should be the advised object
			assert.equals(target, this);

			// arg should be the exception that was thrown
			assert(a instanceof Error);

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

		meld.afterThrowing(target, 'method', function afterReturning1(a) {
			// this should be the advised object
			assert.equals(target, this);

			// arg should be the exception that was thrown
			assert(a instanceof Error);

			// after function should be called (duh) after
			// the original, so val will have changed.
			assert.equals(1, this.val);

			assert.equals(1, count);

			// Increment count so it can be verified in next advice
			count++;
		});

		meld.afterThrowing(target, 'method', function afterReturning2(a) {
			// this should be the advised object
			assert.equals(target, this);

			// arg should be the exception that was thrown
			assert(a instanceof Error);

			// after function should be called (duh) after
			// the original, so val will have changed.
			assert.equals(1, this.val);

			assert.equals(2, count);
		});

		assert.exception(function() {
			target.method(arg);
		});

		// after method call, val should have changed
		assert.equals(1, target.val);
	},

	'should not be invoked when original returns without throwing': function() {
		var target, spy;

		target = new Fixture();
		target.method = this.stub().returns(123);

		spy = this.spy();

		meld.afterThrowing(target, 'method', spy);

		refute.exception(function() {
			target.method(arg);
		});

		// afterThrowing advice should not have been called
		refute.called(spy);
	}
});

})(
	this.buster || require('buster'),
	this.meld || require('../meld')
);