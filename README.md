[![Build Status](https://secure.travis-ci.org/cujojs/meld.png)](http://travis-ci.org/cujojs/meld)

[Aspect Oriented Programming](http://en.wikipedia.org/wiki/Aspect-oriented_programming "Aspect-oriented programming - Wikipedia, the free encyclopedia") for Javascript.  It allows you to change the behavior of, or add behavior to methods and functions (including constructors) *non-invasively*.

As a simple example, instead of changing code, you can use meld to log the result of `myObject.doSomething`:

```js
var myObject = {
	doSomething: function(a, b) {
		return a + b;
	}
};

// Call a function after myObject.doSomething returns
var remover = meld.after(myObject, 'doSomething', function(result) {
	console.log('myObject.doSomething returned: ' + result);
});

myObject.doSomething(1, 2); // Logs: "myObject.doSomething returned: 3"

remover.remove();

myObject.doSomething(1, 2); // Nothing logged
```

# Docs

* [API](meld/blob/master/docs/api.md)
* [Reference](meld/blob/master/docs/reference.md)

# Quick Start

### AMD

1. Get it using one of the following
	1. `yeoman install meld`, or
	1. `bower install meld`, or
	1. `git clone https://github.com/cujojs/meld`, or
	1. `git submodule add https://github.com/cujojs/meld`

1. Configure your loader with a package:

	```js
	packages: [
		{ name: 'meld', location: 'path/to/meld', main: 'meld' },
		// ... other packages ...
	]
	```

1. `define(['meld', ...], function(meld, ...) { ... });` or `require(['meld', ...], function(meld, ...) { ... });`

### Node

1. `npm install meld`
1. `var meld = require('meld');`

### RingoJS

1. `ringo-admin install cujojs/meld`
1. `var meld = require('meld');`

Running the Unit Tests
======================

Install [buster.js](http://busterjs.org/)

`npm install -g buster`

Run unit tests in Node:

`buster test`

# Changelog

### 1.0.0

* **Removed browser global** - `window.meld` is no longer supported. See [this post on the cujo.js Google Group](https://groups.google.com/d/topic/cujojs/K0VGuvpYQ34/discussion) for an explanation.
* No functional change beyond browser global removal.

### 0.8.0

* 1.0.0 Release Candidate 1
* Documentation! Check out the new [reference](meld/blob/master/docs/reference.md) and [api](meld/blob/master/docs/api.md) docs.
* **Deprecated browser global** - meld.js will drop support for browser global for 1.0.0 and will support modular environments only.

### 0.7.2

* Fix for context when advising constructors: `this` is now the constructed instance in all advice functions.

### 0.7.1

* Fix for global name when using meld as a browser global. Thanks [@scothis](https://github.com/scothis)
* Update unit tests to run in browser using `buster server`, in addition to node. Thanks again, [@scothis](https://github.com/scothis) :)

### 0.7.0

* Advice can be applied directly to functions without a context.
* Advice can be applied to constructors.
* `joinpoint.proceed()` can be called multiple times. This makes it possible to implement "retry" types of advice.

### 0.6.0

* aop.js is now meld.js
* Use [Travis CI](http://travis-ci.org/cujojs/meld)

### 0.5.4

* Optimizations to run time advice invocation, especially around advice
* Fix for passing new args to `joinpoint.proceed()` in around advice
* Added `joinpoint.proceedApply(array)` for proceeding and supplying new arguments as an array
* Ported unit tests to [BusterJS](http://busterjs.org)

### 0.5.3

* First official release as part of [cujojs](http://github.com/cujojs)
* Minor doc and package.json tweaks

### 0.5.2

* Revert to larger, more builder-friendly module boilerplate.  No functional change.

### 0.5.1

* Minor corrections and updates to `package.json`

### 0.5.0

* Rewritten Advisor that allows entire aspects to be unwoven (removed) easily.

# Beers to:

* [AspectJ](http://www.eclipse.org/aspectj/) and [Spring Framework AOP](http://static.springsource.org/spring/docs/3.0.x/reference/meld.html) for inspiration and great docs
* Implementation ideas from @phiggins42's [uber.js AOP](https://github.com/phiggins42/uber.js/blob/master/lib/meld.js)
* API ideas from [jquery-aop](http://code.google.com/p/jquery-aop/)