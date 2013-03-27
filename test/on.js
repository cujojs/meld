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
		this.val++;
		return this.val;
	}
};

buster.testCase('on', {

	'should invoke advice after advised method with same args': function() {

		var target = new Fixture();

		// Starting value
		assert.equals(0, target.val);

		meld.on(target, 'method', function on(a) {
			// this should be the advised object
			assert.equals(target, this);

			// arg should be the return value from the orig method
			assert.equals(arg, a);

			// on function should be called after
			// the original, so val will have changed.
			assert.equals(1, this.val);
		});

		var ret = target.method(arg);

		// after method call, val should have changed
		assert.equals(1, target.val);

		// Make sure the return value is preserved
		assert.equals(ret, target.val);
	},

	'should not be invoked if advised method throws': function() {
		var target, spy;

		target = new Fixture();
		target.method = this.stub().throws(new Error());
		spy = this.spy();

		meld.on(target, 'method', spy);

		assert.exception(function() {
			target.method(arg);
		});

		refute.called(spy);
	}

});

})(
	this.buster || require('buster'),
	this.meld || require('../meld')
);