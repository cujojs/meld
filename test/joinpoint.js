(function(buster, meld) {
'use strict';

var assert, refute;

assert = buster.assert;
refute = buster.refute;

buster.testCase('joinpoint', {
	'should be undefined before entering advised function stack': function() {
		refute.defined(meld.joinpoint());
	},

	'should be valid within an advised function stack': function() {
		var target, expected;

		target = {
			method: function() {}
		};

		expected = [1, 2, 3];

		meld.before(target, 'method', verifyJoinpoint);
		meld.on(target, 'method', verifyJoinpoint);
		meld.afterReturning(target, 'method', verifyJoinpoint);
		meld.after(target, 'method', verifyJoinpoint);

		target.method.apply(target, expected);

		refute.defined(meld.joinpoint());

		function verifyJoinpoint() {
			var jp = meld.joinpoint();
			assert.equals(jp.target, target);
			assert.equals(jp.method, 'method');
			assert.equals(jp.args, expected);
		}
	},

	'should be valid within an advised function stack when throwing': function() {
		var target, expected;

		target = {
			method: function() { throw new Error(); }
		};

		expected = [1, 2, 3];

		meld.before(target, 'method', verifyJoinpoint);
		meld.on(target, 'method', verifyJoinpoint);
		meld.afterThrowing(target, 'method', verifyJoinpoint);
		meld.after(target, 'method', verifyJoinpoint);

		assert.exception(function() {
			target.method.apply(target, expected);
		});

		refute.defined(meld.joinpoint());

		function verifyJoinpoint() {
			var jp = meld.joinpoint();
			assert.equals(jp.target, target);
			assert.equals(jp.method, 'method');
			assert.equals(jp.args, expected);
		}
	},

	'should follow nesting for around advice': function() {
		var inner, target, expected;

		inner = this.spy();
		target = {
			method: function() {}
		};
		expected = [1, 2, 3];

		// Inner
		meld.around(target, 'method', function aroundAdviceInner(passedJoinpoint) {
			var joinpoint = meld.joinpoint();
			verifyJoinpoint(joinpoint, passedJoinpoint);

			inner();

			// This will proceed to the original method
			joinpoint.proceed();
		});

		// Outer
		meld.around(target, 'method', function aroundAdviceOuter(passedJoinpoint) {
			var joinpoint = meld.joinpoint();
			verifyJoinpoint(joinpoint, passedJoinpoint);

			refute.calledOnce(inner);

			// This will proceed to the inner around
			joinpoint.proceed();

			// Verify that the inner around around has been called
			assert.calledOnce(inner);
		});

		target.method.apply(target, expected);

		function verifyJoinpoint(meldJoinpoint, passedJoinpoint) {
			assert.same(meldJoinpoint, passedJoinpoint);

			assert.equals(meldJoinpoint.target, target);
			assert.equals(meldJoinpoint.method, 'method');
			assert.equals(meldJoinpoint.args, expected);
		}

	}

});

})(
	this.buster || require('buster'),
	this.meld || require('../meld')
);