(function(buster, meld) {
"use strict";

var assert, refute;

assert = buster.assert;
refute = buster.refute;

var arg = {};

// Test fixture
function Fixture(a) {
	this.prop = a;
}

buster.testCase('constructors', {
	'should advise a constructor using around advise': function() {
		var target, spy, ret;

		target = { method: Fixture };
		spy = this.spy();

		meld.around(target, 'method', function aroundAdvice(joinpoint) {
			var ret;

			spy();
			assert.equals(arg, joinpoint.args[0]);

			ret = joinpoint.proceed();

			assert(ret instanceof Fixture);
			assert.same(Fixture, ret.constructor);
			assert.same(arg, ret.prop);

			return ret;
		});

		ret = new target.method(arg);

		assert.called(spy);
		assert(ret instanceof Fixture);
		assert.same(Fixture, ret.constructor);
		assert.same(arg, ret.prop);
	},

	'should advise a constructor using simple advise': function() {
		var target, spy, ret;

		target = { method: Fixture };
		spy = this.spy();

		meld.before(target, 'method', function beforeAdvice(a) {
			spy();
			assert.equals(arg, a);
		});

		ret = new target.method(arg);

		assert.called(spy);
		assert(ret instanceof Fixture);
		assert.same(Fixture, ret.constructor);
		assert.same(arg, ret.prop);
	},

	'should advise a constructor without context': function() {
		var AdvisedFixture, spy, ret;

		spy = this.spy();
		AdvisedFixture = meld.before(Fixture, spy);

		ret = new AdvisedFixture(arg);
		assert.calledOnceWith(spy, arg);
		assert(ret instanceof Fixture);
		assert.same(Fixture, ret.constructor);
		assert.same(arg, ret.prop);
	}

});

})(
	require('buster'),
	require('../meld')
);