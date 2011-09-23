/**
 * @license Copyright (c) 2011 Brian Cavalier
 * LICENSE: see the LICENSE.txt file. If file is missing, this file is subject
 * to the MIT License at: http://www.opensource.org/licenses/mit-license.php.
 */

(function(define) {
define([], function() {

	var VERSION, ap, prepend, append, slice, isArray;

	VERSION = "0.5.0";

	ap      = Array.prototype;
	prepend = ap.unshift;
	append  = ap.push;
	slice   = ap.slice;

	isArray = Array.isArray || function isArrayShim(it) {
		return Object.prototype.toString.call(it) == '[object Array]';
	};

	// Helper to convert arguments to an array
	function argsToArray(a) {
		return slice.call(a);
	}

	function Advisor(target, func) {

		var orig, advisor;

		this.target = target;
		this.func = func;

		orig = this.orig = target[func];
		advisor = this;

		target[func] = function() {
			var args, result, afterType, exception;

			function callAfter(afterType, args) {
				advisor._callAdvice(advisor.head, afterType, target, args);
			}

			args = argsToArray(arguments);
			afterType = 'afterReturning';

			advisor._callAdvice(advisor.tail, 'before', target, args);

			try {
				result = orig.apply(target, args);
			} catch(e) {
				result = exception = e;
				afterType = 'afterThrowing'
			}

			args = [result];

			callAfter(afterType, args);
			callAfter('after', args);

			advisor._callAdvice(advisor.head, 'after', target, args);

			if(exception) {
				throw exception;
			}

			return result;
		}
	}

	Advisor.prototype = {
		
		// Invoke all advice functions in the supplied context, with the
		// supplied args.
		_callAdvice: function(list, adviceType, context, args) {

			var direction, current, advice;

			direction = list === this.tail ? 'prev' : 'next';
			current = list;

			while (current) {
				advice = current.aspect[adviceType];
				if (advice) {
					advice.apply(context, args);
				}

				current = current[direction];
			}
		},

		// Adds the supplied aspect to the advised target method
		add: function(aspect) {

			var aspectItem, remove;

			aspectItem = {
				prev: this.tail,
				aspect: aspect
			};

			if(this.tail) {
				this.tail = this.tail.next = aspectItem;
			} else {
				this.tail = this.head = aspectItem;
			}

			remove = aspectItem.remove = function() {
				var prev, next;

				prev = aspectItem.prev;
				next = aspectItem.next;

				if(prev) { prev.next = next; }
				if(next) { next.prev = prev; }
			};

			return remove;
		},

		// Removes the Advisor and thus, all aspects from the advised target method.
		remove: function() {
			this.target[this.func]._advisor = null;
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
			advisor = advised._advisor = new Advisor(target, func);
		}

		return advisor;
	};

	function addAspect(target, method, aspect) {
		var advisor = Advisor.get(findTarget(target), method);

		if(advisor) {
			return advisor.add(aspect);
		} else {
			throw new Error('Target does not have method: ' + method);
		}
	}

	// Invoke all advice functions in the supplied context, with the
	// supplied args.
	function callAdvice(advices, context, args) {
		var i, advice;

		i = 0;
		
		while((advice = advices[i++])) {
			advice.apply(context, args);
		}
	}

	// Creates a function to add a new advice function in the correct
	// order (prepend or append).
	function makeAdviceAdd(advices, order) {
		return function(adviceFunc) {
			if(isArray(adviceFunc)) {
				for (var i = 0, len = adviceFunc.length; i < len; i++) {
					order.call(advices, adviceFunc[i]);
				}
			} else {
				order.call(advices, adviceFunc);
			}
		};
	}
	
	// Returns the advisor for the target object-function pair.  A new advisor
	// will be created if one does not already exist.
	function getAdvisor(target, func) {
		if(!(func in target)) return;

		var advised = target[func];

		if(typeof advised !== 'function') throw new Error('Advice can only be applied to functions: ' + func);
		
		if(!advised._advisor) {
			var orig, before, on, around, afterReturning, afterThrowing, after;

			// Save the original, not-yet-advised function
			orig = advised;
			
			// Advices.  They'll be invoked in this order.
			before = [];
			around = {};
			on = [];
			afterReturning = [];
			afterThrowing  = [];
			after = [];

			// Intercept calls to the original function, and invoke
			// all currently registered before, around, and after advices
			advised = target[func] = function() {
				var self, targetArgs, result, afterType;

				self = this;
				targetArgs = argsToArray(arguments);
				afterType = afterReturning;

				function callAdviceWithContext(advice, targetArgs) {
					callAdvice(advice, self, targetArgs);
				}

				// Befores
				callAdviceWithContext(before, targetArgs);
				
				try {
					// Call around if registered.  If not, call original
					result = (around.advice||orig).apply(this, targetArgs);
					callAdviceWithContext(on, targetArgs);

				} catch(e) {
					// If an exception was thrown, save it as the result,
					// and switch to afterThrowing
					result = e;
					afterType = afterThrowing;

				}

				// Set args for after* advice types
				targetArgs = [result];

				// Call the appropriate afterReturning/Throwing advice type based
				// on the outcome of calling the original func or around advice
				callAdviceWithContext(afterType, targetArgs);

				// Always call "after", regardless of success return or exception.
				callAdviceWithContext(after, targetArgs);

				// If the original (or around) threw an exception, rethrow
				// Otherwise, return the result
				if(afterType === afterThrowing) {
					throw result;
				}
				
				return result;
			};

			advised._advisor = {
				before:         makeAdviceAdd(before, prepend),
				on:             makeAdviceAdd(on, append),
				afterReturning: makeAdviceAdd(afterReturning, append),
				afterThrowing:  makeAdviceAdd(afterThrowing, append),
				after:          makeAdviceAdd(after, append),
				around: function(adviceFunc) {
					// Allow around "stacking" by wrapping existing around,
					// if it exists.  If not, wrap orig method.
					var aroundee = around.advice || orig;

					around.advice = function() {
						var args, self, proceed, joinpoint;
						
						// Proceed to next around or original
						proceed = function(modifiedArgs) {
							return aroundee.apply(self, modifiedArgs || args);
						};

						// Joinpoint representing the original method call
						joinpoint = {
							// Original arguments
							args:   (args = argsToArray(arguments)),
							// Target object on which the method was called
							target: (self = this),
							// The name of the method that was called
							method: func,
							// Proceed function.  Advice function should call this to trigger
							// the next around or the original method invocation
							proceed: function(modifiedArgs) {
								// Call next around or original and get result
								var result = proceed(modifiedArgs);

								// Overwrite proceed to ensure the original can only be called once
								proceed = function() { throw new Error("proceed() already called"); };

								return result;
							}
						};

						// Call outermost around advice to start the chain
						return adviceFunc.call(self, joinpoint);
					};
				}
			};			
		}
		
		return advised._advisor;
	}

	// Add a single advice, creating a new advisor for the target func, if necessary.
	function addAdvice(target, func, type, adviceFunc) {
		var advisor = getAdvisor(findTarget(target), func);

		if(advisor) {
			advisor[type](adviceFunc);
		}
		
		return advisor;
	}
	
	// Add several advice types to func
	function addToFunc(object, funcName, advice) {
		// advice is an object, and should have keys for advice types,
		// whose values are the advice functions.

		// First, get the advisor for this object/func pair
		var advisor, addAdvice;
		
		advisor = getAdvisor(object, funcName);

		if(advisor) {
			// Register all advices with the advisor
			for (var a in advice) {
				addAdvice = advisor[a];
				if (addAdvice) {
					addAdvice(advice[a]);
				}
			}
		}
	}

	function adviseAll(object, funcArray, advice) {
		var f, i = 0;
		while((f = funcArray[i++])) {
			advice(object, f);
		}
	}

	function addAspect2(target, pointcut, advice) {
		// pointcut can be: string, Array of strings, RegExp, Function(targetObject): Array of strings
		// advice can be: object, Function(targetObject, targetMethodName)
		
		var pointcutType, adviceFunc;

		target = findTarget(target);

		adviceFunc = typeof advice === 'function'
			? advice
			: function(object, funcName) {
				addToFunc(object, funcName, advice);
			};

		if (isArray(pointcut)) {
			adviseAll(target, pointcut, adviceFunc);

		} else {
			pointcutType = typeof pointcut;

			if (pointcutType === 'string') {
				if (typeof target[pointcut] === 'function') {
					adviceFunc(target, pointcut);
				}

			} else if (pointcutType === 'function') {
				adviseAll(target, pointcut(target), adviceFunc);

			} else {
				// Assume the pointcut is a RegExp
				for (var p in target) {
					// TODO: Decide whether hasOwnProperty is correct here
					// Only apply to own properties that are functions, and match the pointcut regexp
					if (typeof target[p] === 'function' && pointcut.test(p)) {
						// if(object.hasOwnProperty(p) && typeof object[p] === 'function' && pointcut.test(p)) {
						adviceFunc(target, p);

					}
				}

			}
		}
	}

    function findTarget(target) {
        return target.prototype || target;
    }

	// Create an API function for the specified advice type
	function adviceApi(type) {
		return function(target, func, adviceFunc) {
			var aspect = {};
			aspect[type] = adviceFunc;
			
			return addAspect(target, func, aspect);
		};
	}

	// Public API
	return {
		// General add aspect
		add:            addAspect,

		// Add a single, specific type of advice
		before:         adviceApi('before'),
		around:         adviceApi('around'),
		on:             adviceApi('on'),
		afterReturning: adviceApi('afterReturning'),
		afterThrowing:  adviceApi('afterThrowing'),
		after:          adviceApi('after'),

		// Version
		version:        VERSION
	};

});
})(typeof define != 'undefined'
	// use define for AMD if available
	? define
	// If no define, look for module to export as a CommonJS module.
	// If no define or module, attach to current context.
	: typeof module != 'undefined'
		? function(deps, factory) { module.exports = factory(); }
		: function(deps, factory) { this.aop = factory(); }
);
