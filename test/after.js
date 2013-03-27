(function(buster, meld) {
'use strict';

var assert, refute;

assert = buster.assert;
refute = buster.refute;

var arg = 'foo'; // const

// Test fixture
function Fixture(shouldThrow) {
	this.val = 0;
	this.shouldThrow = shouldThrow;
}

Fixture.prototype = {
	method: function() {
		this.val++;
		if(this.shouldThrow) {
			throw new Error('testing after advice with throw');
		}

		return this.val;
	}
};

buster.testCase('after', {
	'should invoke advice after advised method': function() {
		var target = new Fixture();

		// Starting value
		assert.equals(0, target.val);

		meld.after(target, 'method', function afterAdvice(a) {
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

	'should invoke advice after thrown exception': function() {
		var target = new Fixture(true);

		// Starting value
		assert.equals(0, target.val);

		meld.after(target, 'method', function afterAdvice(a) {
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
	}
});

})(
	this.buster || require('buster'),
	this.meld || require('../meld')
);