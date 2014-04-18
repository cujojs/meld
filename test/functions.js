(function(buster, meld) {
'use strict';

var assert = buster.assert;

// Test fixture
function f(x) {
	return x + 1;
}

buster.testCase('functions', {
	'should advise a pure function': function() {
		var advised, spyBefore, spyAfter, ret;

		spyBefore = this.spy();
		spyAfter  = this.spy();
		advised = meld.before(f, spyBefore);
		advised = meld.after(advised, spyAfter);

		ret = advised(1);
		assert.calledOnceWith(spyBefore, 1);
		assert.calledOnceWith(spyAfter, 2);
	},

	'should add aspect to a pure function': function() {
		var advised, spyBefore, spyAround, spyAfter, ret;

		spyBefore = this.spy();
		spyAround = this.spy();
		spyAfter  = this.spy();

		advised = meld(f, {
			before: spyBefore,
			around: function(call) {
				var ret = call.proceed();
				spyAround(ret);
				return ret + 1;
			},
			after: spyAfter
		});

		ret = advised(1);

		assert.calledOnceWith(spyBefore, 1);
		assert.calledOnceWith(spyAround, 2);
		assert.calledOnceWith(spyAfter, 3);
	},

	'should advise a method on a function': function() {
		var before, method;

		function target() {}
		method = target.method = this.spy();
		before = this.spy();

		// Advise the function method
		meld.before(target, 'method', before);

		target.method();

		assert.calledOnce(before);
		assert.calledOnce(method);
	}


});

})(
	this.buster || require('buster'),
	this.meld || require('../meld')
);