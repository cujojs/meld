/** @license MIT License (c) copyright B Cavalier & J Hann */

/**
 * aop
 * Aspect Oriented Programming for Javascript
 *
 * aop is part of the cujo.js family of libraries (http://cujojs.com/)
 *
 * Licensed under the MIT License at:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @version 0.5.4
 */
(function (define) {
define(function () {

	var ap, prepend, append, iterators, slice, isArray, defineProperty, freeze;

	freeze = Object.freeze || function (o) { return o; };

	ap      = Array.prototype;
	prepend = ap.unshift;
	append  = ap.push;
	slice   = ap.slice;

	isArray = Array.isArray || function(it) {
		return Object.prototype.toString.call(it) == '[object Array]';
	};

	defineProperty = Object.defineProperty || function(obj, prop, descriptor) {
		obj[prop] = descriptor.value;
	};

	iterators = {
		// Before uses reverse iteration
		before: forEachReverse,
		around: false
	};

	// All other advice types use forward iteration
	// Around is a special case that uses recursion rather than
	// iteration.  See Advisor._callAroundAdvice
	iterators.on
		= iterators.afterReturning
		= iterators.afterThrowing
		= iterators.after
		= forEach;

	function Advisor(target, func) {

		var orig, advisor, advised;

		this.target = target;
		this.func = func;
		this.aspects = {};

		orig = this.orig = target[func];
		advisor = this;

		advised = this.advised = function() {
			var context, args, result, afterType, exception;

			context = this;
			args = argsToArray(arguments);
			afterType = 'afterReturning';

			advisor._callSimpleAdvice('before', context, args);

			try {
				result = advisor._callAroundAdvice(context, func, args, callOrig);
			} catch(e) {
				result = exception = e;
				// Switch to afterThrowing
				afterType = 'afterThrowing';
			}

			args = [result];

			callAfter(afterType, args);
			callAfter('after', args);

			if(exception) {
				throw exception;
			}

			return result;

			function callOrig(args) {
				var result = orig.apply(context, args);
				advisor._callSimpleAdvice('on', context, args);

				return result;
			}

			function callAfter(afterType, args) {
				advisor._callSimpleAdvice(afterType, context, args);
			}
		};

		defineProperty(advised, '_advisor', { value: advisor });
	}

	Advisor.prototype = {

		   /**
			* Invoke all advice functions in the supplied context, with the supplied args
			*
			* @param adviceType
			* @param context
			* @param args
			*/
		_callSimpleAdvice: function(adviceType, context, args) {

			// before advice runs LIFO, from most-recently added to least-recently added.
			// All other advice is FIFO
			var iterator, advices;

			advices = this.aspects[adviceType];
			if(!advices) return;

			iterator = iterators[adviceType];

			iterator(this.aspects[adviceType], function(aspect) {
				var advice = aspect.advice;
				advice && advice.apply(context, args);
			});
		},

		/**
		 * Invoke all around advice and then the original method
		 *
		 * @param context
		 * @param method
		 * @param args
		 * @param applyOriginal
		 */
		_callAroundAdvice: function (context, method, args, applyOriginal) {
			var len, aspects;

			aspects = this.aspects.around;
			len = aspects ? aspects.length : 0;

			/**
			 * Call the next function in the around chain, which will either be another around
			 * advice, or the orig method.
			 * @param i {Number} index of the around advice
			 * @param args {Array} arguments with with to call the next around advice
			 */
			function callNext(i, args) {
				// If we exhausted all aspects, finally call the original
				// Otherwise, if we found another around, call it
				return i < 0
					? applyOriginal(args)
					: callAround(aspects[i].advice, i, args);
			}

			function callAround(around, i, args) {
				var proceed, joinpoint;

				/**
				 * Create proceed function that calls the next around advice, or the original.  Overwrites itself so that it can only be called once.
				 * @param [args] {Array} optional arguments to use instead of the original arguments
				 */
				proceed = function (args) {
					proceed = proceedAlreadyCalled;
					return callNext(i - 1, args);
				};

				// Joinpoint is immutable
				joinpoint = freeze({
					target: context,
					method: method,
					args: args,
					proceed: proceedCall,
					proceedApply: proceedApply
				});

				// Call supplied around advice function
				return around.call(context, joinpoint);

				function proceedCall() {
					return proceed(arguments.length > 0 ? argsToArray(arguments) : args);
				}

				function proceedApply(newArgs) {
					return proceed(newArgs || args);
				}
			}

			return callNext(len - 1, args);
		},

		/**
		 * Adds the supplied aspect to the advised target method
		 *
		 * @param aspect
		 */
		add: function(aspect) {

			var aspects, advisor, adviceType, advice, advices;

			advisor = this;
			aspects = advisor.aspects;

			for(adviceType in iterators) {
				advice = aspect[adviceType];

				if(advice) {
					advices = aspects[adviceType];
					if(!advices) aspects[adviceType] = advices = [];
					advices.push({
						aspect: aspect,
						advice: advice
					});
				}
			}

			return {
				remove: function () {
					var adviceType, advices, count;

					count = 0;

					for(adviceType in iterators) {
						advices = aspects[adviceType];
						if(advices) {
							count += advices.length;

							for (var i = advices.length - 1; i >= 0; --i) {
								if (advices[i].aspect === aspect) {
									advices.splice(i, 1);
									--count;
									break;
								}
							}
						}
					}

					// If there are no aspects left, restore the original method
					if (!count) {
						advisor.remove();
					}
				}
			};
		},

		/**
		 * Removes the Advisor and thus, all aspects from the advised target method, and
		 * restores the original target method, copying back all properties that may have
		 * been added or updated on the advised function.
		 */
		remove: function () {
			delete this.advised._advisor;
			this.target[this.func] = this.orig;
		}
	};

	// Returns the advisor for the target object-function pair.  A new advisor
	// will be created if one does not already exist.
	Advisor.get = function(target, func) {
		if(!(func in target)) return;

		var advisor, advised;

		advised = target[func];

		if(typeof advised !== 'function') throw new Error('Advice can only be applied to functions: ' + func);

		advisor = advised._advisor;
		if(!advisor) {
			advisor = new Advisor(target, func);
			target[func] = advisor.advised;
		}

		return advisor;
	};

	//
	// Public API
	//

	return {
		// General add aspect
		// Returns a function that will remove the newly-added aspect
		add:            addAspect,

		// Add a single, specific type of advice
		// returns a function that will remove the newly-added advice
		before:         adviceApi('before'),
		around:         adviceApi('around'),
		on:             adviceApi('on'),
		afterReturning: adviceApi('afterReturning'),
		afterThrowing:  adviceApi('afterThrowing'),
		after:          adviceApi('after')
	};

	function addAspect(target, pointcut, aspect) {
		// pointcut can be: string, Array of strings, RegExp, Function(targetObject): Array of strings
		// advice can be: object, Function(targetObject, targetMethodName)

		var pointcutType, remove;

		target = getPointcutTarget(target);

		if (isArray(pointcut)) {
			remove = addAspectToAll(target, pointcut, aspect);

		} else {
			pointcutType = typeof pointcut;

			if (pointcutType === 'string') {
				if (typeof target[pointcut] === 'function') {
					remove = addAspectToMethod(target, pointcut, aspect);
				}

			} else if (pointcutType === 'function') {
				remove = addAspectToAll(target, pointcut(target), aspect);

			} else {
				remove = addAspectToMatches(target, pointcut, aspect);
			}
		}

		return remove;

	}

	function addAspectToMethod(target, method, aspect) {
		var advisor = Advisor.get(target, method);

		return advisor && advisor.add(aspect);
	}

	function addAspectToAll(target, methodArray, aspect) {
		var removers, added, f, i;

		removers = [];
		i = 0;

		while((f = methodArray[i++])) {
			added = addAspectToMethod(target, f, aspect);
			added && removers.push(added);
		}

		return createRemover(removers);
	}

	function addAspectToMatches(target, pointcut, aspect) {
		var removers = [];
		// Assume the pointcut is a an object with a .test() method
		for (var p in target) {
			// TODO: Decide whether hasOwnProperty is correct here
			// Only apply to own properties that are functions, and match the pointcut regexp
			if (typeof target[p] == 'function' && pointcut.test(p)) {
				// if(object.hasOwnProperty(p) && typeof object[p] === 'function' && pointcut.test(p)) {
				removers.push(addAspectToMethod(target, p, aspect));
			}
		}

		return createRemover(removers);
	}

	function createRemover(removers) {
		return {
			remove: function() {
				for (var i = removers.length - 1; i >= 0; --i) {
					removers[i].remove();
				}
			}
		};
	}

	function getPointcutTarget(target) {
		return typeof target == 'function' ? target.prototype||target : target;
	}

	// Create an API function for the specified advice type
	function adviceApi(type) {
		return function(target, func, adviceFunc) {
			var aspect = {};
			aspect[type] = adviceFunc;

			return addAspect(target, func, aspect);
		};
	}

	/**
	 * Helper to convert arguments to an array
	 * @param a {Arguments} arguments
	 * @return {Array}
	 */
	function argsToArray(a) {
		return slice.call(a);
	}

	function forEach(array, func) {
		for (var i = 0, len = array.length; i < len; ++i) {
			func(array[i]);
		}
	}

	function forEachReverse(array, func) {
		for (var i = array.length - 1; i >= 0; --i) {
			func(array[i]);
		}
	}

	function proceedAlreadyCalled() { throw new Error("proceed() may only be called once"); }

});
})(typeof define == 'function'
	? define
	: function (factory) { typeof module != 'undefined'
		? (module.exports = factory())
		: (this.aop = factory());
	}
	// Boilerplate for AMD, Node, and browser global
);
