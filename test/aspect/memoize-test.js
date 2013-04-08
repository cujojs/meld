(function(buster, meld, createMemoizer) {
	'use strict';

	var assert, refute, param;

	assert = buster.assert;
	refute = buster.refute;

	param = { foo: 'bar' };

	buster.testCase('aspect/memoize', {

		'should call original method when key not found': function() {
			var spy, advised;

			spy = this.spy();
			advised = { method: spy };

			meld(advised, 'method', createMemoizer());

			advised.method(param);

			assert.calledWith(spy, param);
		},

		'should not call original method when key has been memoized': function() {
			var spy, advised;

			spy = this.spy();
			advised = { method: spy };

			meld(advised, 'method', createMemoizer());

			advised.method(param);
			advised.method(param);

			assert.calledOnceWith(spy, param);
			refute.calledTwice(spy);
		},

		'default keyGenerator should consider all params when memoizing': function() {
			var spy, advised;

			spy = this.spy();
			advised = { method: spy };

			meld(advised, 'method', createMemoizer());

			advised.method(param, 1);
			advised.method(param, 2);

			assert.calledTwice(spy);
		},

		'should use provided keyGenerator': function() {
			var stubKeyGenerator, advised;

			stubKeyGenerator = this.stub().returns('the key');
			advised = { method: function(/*x, y*/) {} };

			meld(advised, 'method', createMemoizer(stubKeyGenerator));

			advised.method(param, 1);

			assert.calledWith(stubKeyGenerator, [param, 1]);
		}

	});

})(
	require('buster'),
	require('../../meld'),
	require('../../aspect/memoize')
);