(function(buster, aop) {
"use strict";

var assert, refute;

assert = buster.assert;
refute = buster.refute;

buster.testCase('prototype', {

	'should apply aspects to the prototype when given a constructor': function() {
		var before, method, target;

		function Fixture() {}
		method = Fixture.prototype.method = this.spy();
		before = this.spy();

		// Advise the prototype method
		aop.before(Fixture, 'method', before);

		target = new Fixture();
		target.method();

		assert.calledOnce(before);
		assert.calledOnce(method);
	}

});

})(
	this.buster || require('buster'),
	this.meld || require('../meld')
);