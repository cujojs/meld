# meld.js API

1. [Adding Advice](#adding-advice)
	* [meld.before](#meldbefore)
	* [meld.around](#meldaround)
	* [meld.on](#meldon)
	* [meld.afterReturning](#meldafterreturning)
	* [meld.afterThrowing](#meldafterthrowing)
	* [meld.after](#meldafter)
1. [Adding Aspects](#adding-aspects)
	* [meld](#meld)
1. [Removing Method Advice](#removing-method-advice)
1. [Accessing the Joinpoint](#accessing-the-joinpoint)
	* [meld.joinpoint](#meldjoinpoint)
1. [Constructor-specific Info](#constructor-specific-info)

# Adding Advice

## meld.before

```js
var remover = meld.before(object, match, beforeFunction);
```

Adds before advice to matching methods.  The `beforeFunction` will be called before, and will receive the same arguments as the matching method.

**NOTE:** `beforeFunction` should have the same signature as the method, function, or constructor being advised.

```js
var advisedFunction = meld.before(functionToAdvise, beforeFunction);

var AdvisedConstructor = meld.before(ConstructorToAdvise, beforeFunction);
```

Returns a new function or constructor that calls `beforeFunction` before executing the original behavior of `functionToAdvise`/`ConstructorToAdvice`, leaving the original untouched.

## meld.around

```js
function aroundFunction(joinpoint) {
	// ...
}

var remover = meld.around(object, match, aroundFunction);
```

Adds around advice to matching methods.  The `beforeFunction` will be called around the matching method.

```js
var advisedFunction = meld.around(functionToAdvise, aroundFunction);

var AdvisedConstructor = meld.around(ConstructorToAdvise, aroundFunction);
```

Returns a new function or constructor that calls `beforeFunction` before executing the original behavior of `functionToAdvise`/`ConstructorToAdvice`, leaving the original untouched.

### joinpoint

The joinpoint passed to around advice has the following properties:

```js
joinpoint = {
	// Context (i.e. this) of the original method call
	target: <any type>,
	
	// Array of arguments passed to the original method call
	args: Array,
	
	// Name of the original method
	method: String,

	// When, called, causes the original method to be invoked
	// When called without arguments, the original arguments will
	// be passed.
	// When called with arguments, they will be passed
	// *instead of* the original arguments
	proceed: Function,

	// Similar to proceed, but accepts an Array of new
	// arguments, (like Function.apply)
	proceedApply: Function,

	// Returns the number of times proceed and/or proceedApply
	// have been called
	proceedCount: Function
}
```

## meld.on

```js
var remover = meld.on(object, match, onFunction);
```

Adds on advice to matching methods.  The `onFunction` will be called immediately after, and will receive the same arguments as the matching method.

**NOTE:** `onFunction` should have the same signature as the method, function, or constructor being advised.

```js
var advisedFunction = meld.on(functionToAdvise, onFunction);

var AdvisedConstructor = meld.on(ConstructorToAdvise, onFunction);
```

Returns a new function or constructor that calls `beforeFunction` immediately after executing the original behavior of `functionToAdvise`/`ConstructorToAdvice`, leaving the original untouched.

## meld.afterReturning

```js
function afterReturningFunction(returnValue) {
	// ...
}

var remover = meld.afterReturning(object, match, afterReturningFunction);
```

Adds afterReturning advice to matching methods.  The `afterReturningFunction` will be called after the matching method returns successfully (i.e. does not throw), and will receive the return value as its only argument.

**NOTE:** afterReturning advice *will not* be executed when the matching method throws.

```js
var advisedFunction = meld.afterReturning(functionToAdvise, afterReturningFunction);

var AdvisedConstructor = meld.afterReturning(ConstructorToAdvise, afterReturningFunction);
```

Returns a new function or constructor that calls `afterReturningFunction` after the original `functionToAdvise`/`ConstructorToAdvice` returns successfully, leaving the original untouched.

In the specific case of a constructor, the newly constructed instance acts as the return value, and will be the argument provided to the `afterFunction`.

## meld.afterThrowing

```js
function afterThrowingFunction(thrownException) {
	// ...
}

var remover = meld.afterThrowing(object, match, afterThrowingFunction);
```

Adds afterThrowing advice to matching methods.  The `afterThrowingFunction` will be called after the matching method throws an exception, and will receive the thrown exception as its only argument.

**NOTE:** afterThrowing advice *will not* be executed when the matching method returns without throwing.

```js
var advisedFunction = meld.afterThrowing(functionToAdvise, afterThrowingFunction);

var AdvisedConstructor = meld.afterThrowing(ConstructorToAdvise, afterThrowingFunction);
```

Returns a new function or constructor that calls `afterThrowingFunction` after the original `functionToAdvise`/`ConstructorToAdvice` throws an exception, leaving the original untouched.


## meld.after

```js
function afterFunction(returnValueOrThrownException) {
	// ...
}

var remover = meld.after(object, match, afterFunction);
```

Adds after advice to matching methods.  The `afterFunction` will be called after the matching method returns successfully *or* throws an exception, and will receive either the return value or the thrown exception as its only argument.

**NOTE:** after advice will *always* be executed.

```js
var advisedFunction = meld.after(functionToAdvise, afterFunction);

var AdvisedConstructor = meld.after(ConstructorToAdvise, afterFunction);
```

Returns a new function or constructor that calls `afterFunction` after the original `functionToAdvise`/`ConstructorToAdvice` returns successfully or throws an exception, leaving the original untouched.

In the specific case of a constructor, the newly constructed instance acts as the return value, and will be the argument provided to the `afterFunction` when the constructor returns successfully.

# Adding Aspects

Meld.js allows you to add any number of advices to a method, function, or constructor.  In addition to adding them individually, as [shown here](#advising-methods), using the individual advice methods (e.g. meld.before, meld.after, etc.), you can also add several advices at once using `meld()`.

For example, the [bundled aspects](aspects.md) are implemented this way, and can be added using `meld()`.

## meld

**DEPRECATED ALIAS:** meld.add()

```js
// Supply any or all of the advice types at once
var advices = {
	before: function() {
		console.log("Called with: " + Array.prototype.join.call(arguments));
	},
	afterReturning: function(returnValue) {
		console.log("Returned: " + returnValue);
	},
	afterThrowing: function(thrownException) {
		console.error("Exception: " + thrownException);
	}
}

var remover = meld(object, match, advices);
```

Adds multiple advices to each matched method.

```js
var advisedFunction = meld(functionToAdvise, advices);

var AdvisedConstructor = meld(ConstructorToAdvise, advices);
```

Adds multiple advices to the supplied function or constructor.

# Removing Method Advice

See the [Removing Method Advice](reference.md#removing-method-advice) section of the Reference doc.

# Accessing the Joinpoint

[Around advice](#meldaround) receives the current [joinpoint](reference.md#joinpoint) as a parameter.  Other advice types can use `meld.joinpoint()` to retrieve the current joinpoint.

## meld.joinpoint

```js
function myBeforeAdvice() {
	var joinpoint = meld.joinpoint();
	// Use joinpoint fields as necessary
}
```

**IMPORTANT:** The returned joinpoint is only valid within the advice function where it was retrieved by calling `meld.joinpoint`.  You should not cache the joinpoint returned by `meld.joinpoint()` and attempt to use it outside of an advice function, or in different advice functions from that which it was originally retrieved.

# Constructor-specific Info

Advising constructors has a few particulars that are worth noting, or different from advising non-constructor functions and methods.  Specifically:

1. In most cases, the return value of a constructor is the newly constructed instance, and thus it will be the argument provided to afterReturning advice, and to after advice when the constructor returns successfully (i.e. doesn't throw).
1. Constructors are [allowed to return something other than their constructed instance](http://ecma-international.org/ecma-262/5.1/#sec-13.2.2) as long as it is an Object.  When advising constructors, meld.js preserves that behavior.  Around advice, which can modify the return value of a constructor is subject to the same restriction: when returning something other than the constructed instance, it must be an Object.




