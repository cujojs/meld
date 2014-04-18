(function(buster, meld) {
'use strict';

var assert = buster.assert;
var refute = buster.refute;

function Fixture() {}

buster.testCase('remove', {

	'should remove advisor': function() {
		// Just test that the advisor is added, and then
		// removed when the final aspect is removed
		var fixture, ref, advice, advised;

		fixture = new Fixture();
		fixture.method = function() {};

		advice = this.spy();
		ref = meld.before(fixture, 'method', advice);

		assert.defined(fixture.method._advisor);
		advised = fixture.method;

		fixture.method();
		assert.calledOnce(advice);

		ref.remove();

		refute('_advisor' in fixture.method);
		refute('_advisor' in advised);

		fixture.method();
		refute.calledTwice(advice);
	},

	'should remove all advisors': function() {
		var fixture, ref, advice;

		fixture = new Fixture();
		fixture.method1 = function() {};
		fixture.method2 = function() {};

		advice = this.spy();
		ref = meld.before(fixture, /method[12]/, advice);

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

		ref = meld.around(fixture, 'method', advice);

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
		ref = meld(fixture, 'method', aspect);

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