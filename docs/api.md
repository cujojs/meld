# API - meld.js

1. [Adding Advice](#adding-advice)
	* [Methods](#methods)
	* [Functions](#functions)
	* [Constructors](#constructors)
	* Multiple advices, aka "Stacking"
1. [Advice types](#advice-types)
	* [Before](#before)
	* [On](#on)
	* [After Returning](#after-returning)
	* [After Throwing](#after-throwing)
	* [After (Finally)](#after-finally)
	* [Around](#around)
        * Joinpoint
1. [Removing Advice](#removing-advice)

# Adding Advice

## Methods

Adding advice to a method:

```js
// Call a function before myObject.doSomething
meld.before(myObject, 'doSomething', function() {
	console.log(arguments.length);
});

myObject.doSomething(1, 2, 3); // Logs: "3"
```

### Matching method names

You can also pass an Array, a RegExp, or even a function as the second parameter, and meld will apply the advice to all methods that match.

#### Array match

```js
// Use an Array to call a function before particular methods of myObject
meld.before(myObject, ['doSomething', 'doSomethingElse'], function() {
	console.log(arguments.length);
});

myObject.doSomething(1, 2, 3); // Logs: "3"
myObject.doSomethingElse(1, 2); // Logs: "2"
myObject.someOtherMethod(1, 2); // Doesn't log anything
```

#### RegExp match

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

#### Function match

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

## Functions

Advice can be added directly to functions that don't have a context.  In this case, an *advised function* is returned, and the original function is left untouched.

```js
function originalDoSomething(a, b) {
	return a + b;
}

var doSomething = originalDoSomething;

doSomething(1, 2); // Doesn't log anything

// Add before advice directly to the original function
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

## Constructors

Advice can be added to constructor functions that are invoked with `new`:

*TODO: Example*

## Multiple advices

Meld allows you to add multiple advice functions.

# Advice types

## Before

```js
var remover = meld.before(object, match, beforeFunction);
```

Adds before advice to [matching methods](#matching-method-names).  The `beforeFunction` will be called before the matching method.

```js
var advisedFunction = meld.before(functionToAdvise, beforeFunction);
```

Returns a new function that calls `beforeFunction` before executing the original behavior of `functionToAdvise`, leaving the original `functionToAdvise` untouched.

## On

## AfterReturning

## AfterThrowing

## After (Finally)

## Around

### Joinpoint

# Removing Advice
