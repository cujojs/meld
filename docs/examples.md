
```js
var myObject = {
	doSomething: function(a, b) {
		if(arguments.length < 2) {
			throw new Error('doSomething must be called with 2 arguments');
		}
		return a + b;
	}
};

meld.before(myObject, 'doSomething', function() {
	var args = Array.prototype.join.call(arguments);
	console.log('myObject.doSomething called with: ' + args);
});

meld.afterReturning(myObject, 'doSomething', function(result) {
	console.log('myObject.doSomething returned: ' + result);
});

meld.afterThrowing(myObject, 'doSomething', function(exception) {
	console.error('myObject.doSomething threw: ' + exception);
});

// myObject.doSomething called with: 1,2
// myObject.doSomething returned: 3
myObject.doSomething(1, 2);

// myObject.doSomething called with: 1
// myObject.doSomething threw: Error: doSomething must be called with 2 arguments
myObject.doSomething(1);
```

```js
var myObject = {
	doSomething: function(a, b) {
		if(arguments.length < 2) {
			throw new Error('doSomething must be called with 2 arguments');
		}
		return a + b;
	}
};

var cache = {};
meld.around(myObject, 'doSomething', function(methodCall) {
	var cacheKey, result;

	cacheKey = methodCall.args.join();

	if(cacheKey in cache) {
		result = cache[cacheKey];
	} else {
		result = methodCall.proceed();
		cache[cacheKey] = result;
	}

	return result;
});
```