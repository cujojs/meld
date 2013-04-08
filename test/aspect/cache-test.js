(function(buster, meld, createCache) {
'use strict';

var assert, refute, param, sentinel;

assert = buster.assert;
refute = buster.refute;

param = { foo: 'bar' };
sentinel = {};

function noop() {}

buster.testCase('aspect/cache', {

	'should call original method when key not found': function() {
		var spy, advised, cache, key;

		spy = this.stub();
		advised = { method: spy };
		cache = {
			has: this.stub().returns(false),
			set: noop
		};

		meld(advised, 'method', createCache(cache));

		advised.method(param);

		key = JSON.stringify([param]);
		assert.calledOnceWith(cache.has, key);
		assert.calledWith(spy, param);
	},

	'should not call original method when key has been cached': function() {
		var spy, advised, cache;

		spy = this.spy();
		advised = { method: spy };
		cache = {
			has: this.stub().returns(true),
			get: this.stub().returns(sentinel)
		};

		meld(advised, 'method', createCache(cache));

		assert.same(advised.method(param), sentinel);

		assert.calledOnce(cache.get);
		refute.called(spy);
	},

	'should place new items into the cache': function() {
		var stub, advised, cache, key;

		stub = this.stub().returns(sentinel);
		advised = { method: stub };
		cache = {
			has: this.stub().returns(false),
			set: this.spy()
		};

		meld(advised, 'method', createCache(cache));

		advised.method(param);

		key = JSON.stringify([param]);
		assert.calledWith(cache.set, key, sentinel);
	},

	'should use provided keyGenerator': function() {
		var stubKeyGenerator, advised, spy, cache;

		stubKeyGenerator = this.stub().returns(sentinel);
		spy = this.stub();
		advised = { method: spy };
		cache = {
			has: this.stub().returns(true),
			set: noop,
			get: this.stub()
		};

		meld(advised, 'method', createCache(cache, stubKeyGenerator));

		advised.method(param, 1);

		assert.calledWith(stubKeyGenerator, [param, 1]);
		assert.calledWith(cache.has, sentinel);
	}

});

})(
	require('buster'),
	require('../../meld'),
	require('../../aspect/cache')
);