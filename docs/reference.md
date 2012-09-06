# meld.js Reference

1. [Advice](#advice)
1. [Advice Types](#advice-types)
	* [Before](#before)
	* [On](#on)
	* [After Returning](#after-returning)
	* [After Throwing](#after-throwing)
	* [After (Finally)](#after-finally)
	* [Around](#around)
		* [Joinpoint](#joinpoint)
1. [Advice Order](#advice-order)
1. [Advising Methods](#advising-methods)
	* [Matching method names](#matching-method-names)
1. [Removing Method Advice](#removing-method-advice)
1. [Advising Functions](#advising-functions)
1. [Advising Constructors](#advising-constructors)

# Advice

Advice is additional functionality that can be added to a method or function *noninvasively* rather than being coded directly into the original.  This has the advantage of allowing the original to be simpler and to be concerned only with its primary purpose.  It also allows the advice to be applied to many methods or functions, to be easily enabled or disabled, as well as to be maintained and tested separately.

Some common examples of advice are:

1. Logging function parameters and return values for debugging.
1. Collecting statistics about execution time
1. Caching/memoization
1. Transaction demarcation

## Simple Caching Example

Here is a simple example of using meld.js to add caching to an existing method.

```js
// A simple object with a method whose results we'd like to
// cache/memoize
var myObject = {
	doSomething: function(a, b) {
		if(arguments.length < 2) {
			throw new Error('doSomething must be called with 2 arguments');
		}

		// This is a trivial computation, not really worth
		// caching, but could easily be something more complex.
		return a + b;
	}
};

var cache = {};
meld.around(myObject, 'doSomething', function(methodCall) {
	var cacheKey, result;

	// Create a simple cache key from the arguments passed
	// to the original method call.
	cacheKey = methodCall.args.join();

	if(cacheKey in cache) {
		// If the cacheKey was found, return the cached result
		result = cache[cacheKey];
	} else {
		// If not, allow the original method to be executed,
		// with it's original arguments, and compute the result.
		result = methodCall.proceed();
		cache[cacheKey] = result;
	}

	return result;
});

var result;

// No results cached yet, so this will compute the result
// and cache it.
result = myObject.doSomething(1, 2);

// The previous call caused the result of 1 + 2 to be cached,
// so this call will simply return the cached result.
result = myObject.doSomething(1, 2);
```

# Advice Types

## Before

*Before* executes before another function, and receives the same parameters.

## On

*On* advice executes, conceptually, at the same time as another function, and receives the same parameters.

## AfterReturning

*AfterReturning* advice executes after another function returns, and receives the return value as its parameter.

## AfterThrowing

*AfterThrowing* advice executes after another function throws, and receives the thrown exception as its parameter.

## After (finally)

*After* advice executes after another function returns *or* throws, and receives either the return value or the thrown exception as its parameter.

## Around

*Around* is the most powerful type of advice and, as its name implies, executes *around* another function.  It may execute code before and after the original function, modify the arguments passed to the original, or even elect to prevent the original function from executing at all (see the [Simple Caching Example](#simple-caching-example] above).

Around advice receives a [Joinpoint](#joinpoint) as its only parameter, which it can use to access the original arguments, context, and method name of the original function, as well as allow the original function to continue, with either its original arguments, or a modified list of arguments.

### Joinpoint

A joinpoint is the point at which a method or function was intercepted.  Think of it as a description of the original function invocation.

# Advice Order

When multiple advices are added to the same method or function, they run in the following order. Note that *before* advice runs in LIFO order, while all other advice types run in FIFO order.

1. *Before* advice in LIFO order
1. *Around* advice:
	1. All code up to calling `joinpoint.proceed()` in LIFO order
	1. *On* advice in FIFO order
	1. All code after calling `joinpoint.process()` in FIFO order
1. *AfterReturning* or *AfterThrowing* advice in FIFO order
1. *After* (finally) advice in FIFO order

# Advising Methods

Adding advice to a method:

```js
// Call a function before myObject.doSomething
meld.before(myObject, 'doSomething', function() {
	console.log(arguments.length);
});

myObject.doSomething(1, 2, 3); // Logs: "3"
```

## Matching method names

You can also pass an Array, a RegExp, or even a function as the second parameter, and meld will apply the advice to all methods that match.

### Array match

```js
// Use an Array to call a function before particular methods of myObject
meld.before(myObject, ['doSomething', 'doSomethingElse'], function() {
	console.log(arguments.length);
});

myObject.doSomething(1, 2, 3); // Logs: "3"
myObject.doSomethingElse(1, 2); // Logs: "2"
myObject.someOtherMethod(1, 2); // Doesn't log anything
```

### RegExp match

```js
// Use a RegExp to call a function before methods of myObject
// whose name matches.
meld.before(myObject, /^doSomething/, function() {
	console.log(arguments.length);
});

myObject.doSomething(1, 2, 3); // Logs: "3"
myObject.doSomethingElse(1, 2); // Logs: "2"
myObject.someOtherMethod(1, 2); // Doesn't log anything
```

### Function match

```js
// Use a Function matcher to call a function before
// particular methods of myObject
meld.before(myObject,
	function(targetObject) {
		// Matcher function must return an Array of method names
		// In this case, match all owned method, whose name is
		// shorter than 15 characters
		return Object.keys(targetObject).filter(function(name) {
			return name.length < 15;
		});
	},
	function() {
		console.log(arguments.length);
	}
);

myObject.doSomething(1, 2, 3); // Logs: "3"
myObject.doSomethingElse(1, 2); // Doesn't log anything
myObject.someOtherMethod(1, 2); // Doesn't log anything
```

# Removing Method Advice

When adding advice to object methods, meld returns an object with a `remove()` method that can be used to remove the advice that was just added.

```js
// Call a function before myObject.doSomething
var remover = meld.before(myObject, 'doSomething', function() {
	console.log(arguments.length);
});

myObject.doSomething(1, 2, 3); // Logs: "3"

remover.remove();

myObject.doSomething(1, 2, 3); // Nothing logged
```

When adding advice to functions and constructors, meld leaves the original function or constructor unmodified, and returns a *new function or constructor*.  Thus, there is no need to "remove" advice.  Simply discard the new function or constructor and use the original.

# Advising Functions

Advice can be added directly to functions that don't have a context.  In this case, an *advised function* is returned, and the original function is left untouched.

```js
var doSomething = function(a, b) {
	return a + b;
}

var originalDoSomething = doSomething;

doSomething(1, 2); // Doesn't log anything

// Add before advice directly to the original function.
// This returns an advised function, so it's important
// to use the return value.
doSomething = meld.before(doSomething, function() {
	console.log(arguments.length);
});

// New function has before advice applied
doSomething(1, 2); // Logs: "2"

// Original function has not been modified
originalDoSomething(1, 2); // Doesn't log anything
```

# Advising Constructors

Advice can be added to constructor functions that are invoked with `new`.  Similarly to [advising functions](#advising-functions), advising a constructor returns an *advised constructor* function, and the original constructor is left untouched.

```js
var Thing = function(name) {
	this.name = name;
}

// Save the original constructor
var OriginalThing = Thing;

var t = new Thing('Bob');
console.log(t.name); // Logs 'Bob'

// Add after advice directly to the Thing constructor.
// This returns an advised constructor, so it's important
// to use the return value.
Thing = meld.after(Thing, function() {
	// Note that `this` is the constructed object, and
	// is an instanceof Thing, just as if this code
	// were inside the original Thing constructor
	this.name += 'by';
});

// New constructor has advice applied
t = new Thing('Bob');
console.log(t.name); // Logs 'Bobby'

// Original constructor has not been modified
t = new OriginalThing('Bob');
console.log(t.name); // Logs 'Bob'
```

