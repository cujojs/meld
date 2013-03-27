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

buster.testCase('before', {
	'should invoke advice before advised method': function() {
		var target = new Fixture();

		meld.before(target, 'method', function before1(a) {
			// this should be the advised object
			assert.equals(target, this);

			// arg should not change
			assert.equals(arg, a);

			// before function should be called (duh) before
			// the original, so val should not have changed yet.
			assert.equals(0, this.val);
		});

		var ret = target.method(arg);

		// after method call, val should have changed
		assert.equals(1, target.val);

		// Make sure the return value is preserved
		assert.equals(ret, target.val);

	},

	'should invoke most recently added advices first': function() {
		var target = new Fixture();
		var beforeCount = 0;

		// Add 3 before advices and test their invocation order,
		// args, and return value

		meld.before(target, 'method', function before0(a) {
			assert.equals(target, this);
			assert.equals(arg, a);

			// *ALL* before functions should be called (duh) before
			// the original, so val should not have changed yet.
			assert.equals(0, this.val);

			// Before advice is stacked such that advice added
			// later is called first, so beforeCount should have
			// been incremented.
			assert.equals(2, beforeCount);
		});

		meld.before(target, 'method', function before1(a) {
			assert.equals(target, this);
			assert.equals(arg, a);

			// *ALL* before functions should be called (duh) before
			// the original, so val should not have changed yet.
			assert.equals(0, this.val);

			// Before advice is stacked "right to left", such that
			// advice added later is called first, so before2
			// should be called earlier than before1, and beforeCount
			// should have been incremented.
			assert.equals(1, beforeCount);

			// Increment beforeCount so it can be verified in before0
			beforeCount++;
		});

		meld.before(target, 'method', function before2(a) {
			assert.equals(target, this);
			assert.equals(arg, a);

			// *ALL* before functions should be called (duh) before
			// the original, so val should not have changed yet.
			assert.equals(0, this.val);

			// before2 should be called first, so beforeCount should
			// be zero.
			assert.equals(0, beforeCount);

			// Increment beforeCount so it can be verified in before1
			beforeCount++;
		});

		var ret = target.method(arg);

		// original method should only have been called once, so
		// val should only be 1.
		assert.equals(1, target.val);

		// Make sure the return value is preserved
		assert.equals(ret, target.val);
	}
});

})(
	this.buster || require('buster'),
	this.meld || require('../meld')
);