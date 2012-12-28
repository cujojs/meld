(function(buster, meld) {
'use strict';

var assert, refute;

assert = buster.assert;
refute = buster.refute;

buster.testCase('prototype', {

	'should apply aspects to the prototype when given a prototype': function() {
		var before, method, target;

		function Fixture() {}
		method = Fixture.prototype.method = this.spy();
		before = this.spy();

		// Advise the prototype method
		meld.before(Fixture.prototype, 'method', before);

		target = new Fixture();
		target.method();

		assert.calledOnce(before);
		assert.calledOnce(method);

		// This is quite obviously impossible, but refute it anyway :)
		refute(target.hasOwnProperty('method'));
	}

});

})(
	this.buster || require('buster'),
	this.meld || require('../meld')
);