/**
 * @license Copyright (c) 2011 Brian Cavalier
 * LICENSE: see the LICENSE.txt file. If file is missing, this file is subject
 * to the MIT License at: http://www.opensource.org/licenses/mit-license.php.
 */

// TODO:
// 1. Strategy for removing advice
// 2. Provide access to advisor
(function(define, undef) {
define([], function() {
	
	var ap, prepend, append, slice;
	
	ap      = Array.prototype;
	prepend = ap.unshift;
	append  = ap.push;
	slice   = ap.slice;
	
	// Helper to convert arguments to an array
	function argsToArray(a) {
		return slice.call(a);
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
			order.call(advices, adviceFunc);
		};
	}
	
	// Returns the advisor for the target object-function pair.  A new advisor
	// will be created if one does not already exist.
	function getAdvisor(target, func) {
		var advised = target[func];
		
		if(!advised._advisor) {
			var orig, before, around, on, afterReturning, afterThrowing, after;

			// Save the original, not-yet-advised function
			orig = advised;
			
			// Advices.  They'll be invoked in this order.
			before = [];
			around = {};
			on = [];
			afterReturning = [];
			afterThrowing  = [];
			after  = [];

			// Intercept calls to the original function, and invoke
			// all currently registered before, around, and after advices
			advised = target[func] = function() {
				var targetArgs, result, afterType;

				targetArgs = argsToArray(arguments);
				afterType = afterReturning;

				// Befores
				callAdvice(before, this, targetArgs);
				
				try {
					// Call around if registered.  If not, call original
					if(around.advice) {
						// Around advice will execute 'on' advice, so we don't
						// call them here.
						result = around.advice.apply(this, targetArgs);
					} else {
						// When calling original, also call 'on' advice
						result = orig.apply(this, targetArgs);
						callAdvice(on, this, targetArgs);
					}
					
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
				callAdvice(afterType, this, targetArgs);					

				// Always call "after", regardless of success return or exception.
				callAdvice(after, this, targetArgs);

				// TODO:
				// Should we check for exception having been thrown and re-throw
				// instead of returning?  Methinks yes, but need to do more research.
				// if(afterType === afterThrowing) {
				// 	throw result;
				// }
				
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
						var args, self;
						
						args = argsToArray(arguments);
						self = this;

						function proceed(modifiedArgs) {
							var result = aroundee.apply(self, modifiedArgs||args);
							callAdvice(on, self, args);
							return result;
						}

						return adviceFunc.call(self, { args: args, target: self, proceed: proceed });
					};
				}
			};			
		}
		
		return advised._advisor;
	}

	// Add a single advice, creating a new advisor for the target func, if necessary.
	function addAdvice(object, func, type, adviceFunc) {
		var advisor = getAdvisor(object, func);

		advisor[type](adviceFunc);

		return advisor;
	}
	
	// Add an aspect, which may consist of multiple advices.
	function add(object, func, aspect) {
		// aspect is an object, and should have keys for advice types,
		// whose values are the advice functions.
		
		// First, get the advisor for this object/func pair
		var advisor = getAdvisor(object, func);
		
		// Register all advices with the advisor
		for(var a in aspect) {
			advisor[a](aspect[a]);
		}		
	}

	// Create an API function for the specified advice type
	function adviceApi(type) {
		return function(target, func, adviceFunc) {
			return addAdvice(target, func, type, adviceFunc);
		}
	}

	// Public API
	return {
		// General add aspect
		add:            add,

		// Add a single, specific type of advice
		before:         adviceApi('before'),
		around:         adviceApi('around'),
		on:             adviceApi('on'),
		afterReturning: adviceApi('afterReturning'),
		afterThrowing:  adviceApi('afterThrowing'),
		after:          adviceApi('after')
	};

});
})(typeof define != 'undefined' ? define : function(deps, factory){
    // global aop, if not loaded via require
    this.aop = factory();
});