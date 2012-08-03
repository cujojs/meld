[Aspect Oriented Programming](http://en.wikipedia.org/wiki/Aspect-oriented_programming "Aspect-oriented programming - Wikipedia, the free encyclopedia") for Javascript.

## Changelog

### v0.6.0

* aop.js is now meld.js
* Use [buster.js](http://busterjs.org) for all unit tests
* Use [Travis CI](http://travis-ci.org/cujojs/meld)

### v0.5.4

* Optimizations to run time advice invocation, especially around advice
* Fix for passing new args to `joinpoint.proceed()` in around advice
* Added `joinpoint.proceedApply(array)` for proceeding and supplying new arguments as an array
* Ported unit tests to [BusterJS](http://busterjs.org]

### v0.5.3

* First official release as part of [cujojs](http://github.com/cujojs)
* Minor doc and package.json tweaks

### v0.5.2

* Revert to larger, more builder-friendly module boilerplate.  No functional change.

### v0.5.1

* Minor corrections and updates to `package.json`

### v0.5.0

* Rewritten Advisor that allows entire aspects to be unwoven (removed) easily.

# Beers to:

* [AspectJ](http://www.eclipse.org/aspectj/) and [Spring Framework AOP](http://static.springsource.org/spring/docs/3.0.x/reference/aop.html) for inspiration and great docs
* Implementation ideas from @phiggins42's [uber.js AOP](https://github.com/phiggins42/uber.js/blob/master/lib/aop.js)
* API ideas from [jquery-aop](http://code.google.com/p/jquery-aop/)