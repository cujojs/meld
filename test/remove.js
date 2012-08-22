(function(buster, aop) {
"use strict";

var assert, refute;

assert = buster.assert;
refute = buster.refute;

function Fixture() {}

buster.testCase('remove', {

	'should remove advisor': function() {
		// Just test that the advisor is added, and then
		// removed when the final aspect is removed
		var fixture, ref, advice;

		fixture = new Fixture();
		fixture.method = function() {};

		advice = this.spy();
		ref = aop.before(fixture, 'method', advice);

		assert.defined(fixture.method._advisor);

		fixture.method();
		assert.calledOnce(advice);

		ref.remove();

		refute('_advisor' in fixture.method);

		fixture.method();
		refute.calledTwice(advice);
	},

	'should remove all advisors': function() {
		var fixture, ref, advice;

		fixture = new Fixture();
		fixture.method1 = function() {};
		fixture.method2 = function() {};

		advice = this.spy();
		ref = aop.before(fixture, /method[12]/, advice);

		assert.defined(fixture.method1._advisor);
		assert.defined(fixture.method2._advisor);

		fixture.method1();
		fixture.method2();
		assert.calledTwice(advice);

		ref.remove();

		refute('_advisor' in fixture.method1);
		refute('_advisor' in fixture.method2);

		fixture.method1();
		fixture.method2();
		assert.calledTwice(advice);
	},

	'should remove around advice': function() {
		var fixture, ref, spy, advice;

		fixture = new Fixture();
		spy = fixture.method = this.spy();
		advice = this.spy();

		ref = aop.around(fixture, 'method', advice);

		fixture.method();

		refute.calledOnce(spy);
		assert.calledOnce(advice);

		ref.remove();

		fixture.method();

		assert.calledOnce(spy);
		refute.calledTwice(advice);

	},

	'should remove an entire aspect atomically': function() {
		var fixture, aspect, ref, advice;

		aspect = {
			before:         this.spy(),
			around:         this.spy(),
			afterReturning: this.spy(),
			after:          this.spy()
		};

		fixture = new Fixture();
		fixture.method = this.spy();
		ref = aop.add(fixture, 'method', aspect);

		fixture.method();

		for(advice in aspect) {
			assert.calledOnce(aspect[advice]);
		}

		ref.remove();

		fixture.method();

		// after removing, advice should not be called
		for(advice in aspect) {
			refute.calledTwice(aspect[advice]);
		}

	}

});

})(
	this.buster || require('buster'),
	this.meld || require('../meld')
);