# meld.js API

1. meld.before
1. meld.around
1. meld.on
1. meld.afterReturning
1. meld.afterThrowing
1. meld.after
1. meld.add

# TODO

1. Write API sections about each advice type, similar to this:

```js
var remover = meld.before(object, match, beforeFunction);
```

Adds before advice to [matching methods](#matching-method-names).  The `beforeFunction` will be called before the matching method.

```js
var advisedFunction = meld.before(functionToAdvise, beforeFunction);
```

Returns a new function that calls `beforeFunction` before executing the original behavior of `functionToAdvise`, leaving the original `functionToAdvise` untouched.

