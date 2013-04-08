# meld.js Bundled Aspects

1. [Aspects](#aspects)
1. [aspect/trace](#aspecttrace) - Method/function tracing
1. [aspect/memoize](#aspectmemoize) - Simple memoization
1. [aspect/cache](#aspectcache) - Caching

# Aspects

Besides adding individual advices, such as before, afterReturning, etc., meld supports adding aspects, which are essentially one or more pieces of advice that work together to implement some functionality.  Aspects can be added using [meld](api.md#adding-aspects)

Meld comes with several aspects, in the `aspect` dir, that you can use, and that serve as examples for implementing your own.

# aspect/trace

```js
var trace = require('meld/aspect/trace');

var traced = meld(object, pointcut, trace());
// or
var traced = meld(func, trace());
```

Creates an aspect that traces method and function calls, and to report when they are called, their parameters, and whether each returns successfully or throws an exception, with the associated return value or throw exception.  By default, the trace aspect uses a builtin reporter that simply logs information using `console.log`.

You can supply your own reporter, which will be called when a method/function is called, returns, or throws:

```js
var myReporter = {
	// Called just before any traced method/function is called
	onCall: function(info) {
		// info == { target, method, args };
		// target: context on which method was invoked
		// method: name of the method
		// args: Array of arguments passed to method
	},

	// Called after a traced method returns successfully
	onReturn: function(info) {
		// info == { target, method, result };
		// target: context on which method was invoked
		// method: name of the method
		// result: return value
	},

	// Called after a traced method throws an exception
	onThrow: function(info) {
		// info == { target, method, exception };
		// target: context on which method was invoked
		// method: name of the method
		// exception: exception that was thrown
	}
}

var traced = meld(object, pointcut, trace(myReporter));
```

# aspect/memoize

```js
var memoize = require('meld/aspect/memoize');

var memoized = meld(object, pointcut, memoize());
// or
var memoized = meld(func, memoize());
```

Creates an aspect that [memoizes](http://en.wikipedia.org/wiki/Memoization) a method or function.  The first call to any memoized method or function with a specific set of params will always execute the original method/function.  The result will be stored in a table for fast lookup the next time the method/function is invoked *with the same params*.  Thus, subsequent calls to the memoized method/function with previously used params will always return a value from the map.

The aspect relies on a key generation function that creates a unique hash key from an array of params.  By default, it uses `JSON.stringify`, but you can supply your own key generator function:

```js
function myKeyGenerator(paramsArray) {
	var key;

	// create a string or numeric key to use in storing values for this set of params

	return key;
}

var memoized = meld(object, pointcut, memoize(myKeyGenerator));
```

# aspect/cache

```js
var cache = require('meld/aspect/cache');

var cached = meld(object, pointcut, cache(storage));
// or
var cached = meld(func, cache(storage));
```

Creates an aspect that can help in performing more sophisticated caching than the [memoize aspect](#aspectmemoize).  You must supply a cache storage object that implements the following API:

```js
storage = {
	// Return true if the supplied key exists in the cache, or false otherwise.
	has: function(key) {},

	// Return the value associated with the supplied key, or undefined if the
	// key does not exist in the cache.
	get: function(key) {},

	// Add the supplied key and associated value to the cache, or overwrite
	// the value if the key already exists in the cache.
	set: function(key, value) {},
};
```

This allows your cache storage to implement whatever caching strategy meets your needs.  For example, it may limit the number of items that can be stored in the cache, or evict items after a certain amount of time, etc.

You can also supply a key generation function that creates a unique hash key from an array of params.  By default, it uses `JSON.stringify`, but you can supply your own key generator function as the second argument when creating the cache aspect:

```js
function myKeyGenerator(paramsArray) {
	var key;

	// create a string or numeric key to use in storing values for this set of params

	return key;
}

var cached = meld(object, pointcut, cache(storage, myKeyGenerator));
```
