# meld.js API

1. Adding Advice
	* meld.before
	* meld.around
	* meld.on
	* meld.afterReturning
	* meld.afterThrowing
	* meld.after
1. Adding Multiple Advices
	* meld.add
1. Removing Method Advice

# Adding Advice

## meld.before

```js
var remover = meld.before(object, match, beforeFunction);
```

Adds before advice to matching methods.  The `beforeFunction` will be called before the matching method.

```js
var advisedFunction = meld.before(functionToAdvise, beforeFunction);

var AdvisedConstructor = meld.before(ConstructorToAdvise, beforeFunction);
```

Returns a new function or constructor that calls `beforeFunction` before executing the original behavior of `functionToAdvise`/`ConstructorToAdvice`, leaving the original untouched.

**NOTE:** `beforeFunction` should have the same signature as the method, function, or constructor being advised.

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

