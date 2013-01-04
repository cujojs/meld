/**
 * memoize
 * @author: brian
 */
(function(define) {
define(function(require) {

	var createCacheAspect = require('./cache');

	function SimpleCache(memos) {
		this._cache = memos || {};
	}

	SimpleCache.prototype = {
		has: function(key) { return key in this._cache; },
		get: function(key) { return this._cache[key]; },
		set: function(key, value) { this._cache[key] = value; }
	};

	return function(keyGenerator, memoStorage) {
		return createCacheAspect(new SimpleCache(memoStorage), keyGenerator);
	};

});
}(typeof define === 'function' ? define : function(factory) { module.exports = factory(require); }));
