(function(buster, meld) {

var assert, refute, arg;

assert = buster.assert;
refute = buster.refute;

arg = {};
function method() {}

// Test fixture
function Fixture(a) {
	this.prop = a;
	this.method = method;
}

Fixture.prototype = {
	prototypeMethod: function() {},
	prototypeProperty: true
};

function FixtureThrows(a) {
	throw new Error(a);
}

buster.testCase('constructors', {
	'should provide correct context to advice types': function() {
		/*jshint nonew:false*/
		var Advised, count;

		Advised = Fixture;
		count = 0;

		Advised = meld.before(Advised, verifyContext);
		Advised = meld.on(Advised, verifyContext);
		Advised = meld.around(Advised, verifyContextAround);
		Advised = meld.afterReturning(Advised, verifyContext);
		Advised = meld.after(Advised, verifyContext);

		new Advised();
		assert.equals(count, 5);

		function verifyContext() {
			count++;
			assert(this instanceof Fixture);
		}

		function verifyContextAround(jp) {
			verifyContext.call(this);
			return jp.proceed();
		}
	},

	'should provide correct context to afterThrowing': function() {
		/*jshint nonew:false*/
		var Advised;

		Advised = meld.afterThrowing(FixtureThrows, verifyContext);

		assert.exception(function() {
			new Advised();
		});

		function verifyContext() {
			assert(this instanceof FixtureThrows);
		}
	},

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
		assert.same(ret.constructor, Fixture);

		// Make sure prototype methods are preserved, and are
		// still on the prototype and have not been promoted to own props
		assert.same(ret.prototypeMethod, Fixture.prototype.prototypeMethod);
		refute(ret.hasOwnProperty('prototypeMethod'));

		// Make sure instance methods and props added in the constructor
		// are preserved
		assert.same(ret.method, method);
		assert.same(ret.prop, arg);
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
		assert.same(ret.constructor, Fixture);
		assert.same(ret.prop, arg);
	},

	'should advise a constructor without context': function() {
		var AdvisedFixture, spy, ret;

		spy = this.spy();
		AdvisedFixture = meld.before(Fixture, spy);

		ret = new AdvisedFixture(arg);
		assert.calledOnceWith(spy, arg);
		assert(ret instanceof Fixture);
		assert.same(ret.constructor, Fixture);
		assert.same(ret.prop, arg);
	}

});

})(
	this.buster || require('buster'),
	this.meld || require('../meld')
);