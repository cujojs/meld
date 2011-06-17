
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
	
	function argsToArray(a) {
		return slice.call(a);
	}

	function callAdvice(advices, target, args) {
		var i, advice;

		i = 0;
		
		while((advice = advices[i++])) {
			advice.apply(target, args);
		}
	}

	function makeAdviceAdd(advices, order) {
		return function(adviceFunc) {
			order.call(advices, adviceFunc);
		};
	}
	
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
				
				// Call around if registered.  If not, call original
				try {
					if(around.advice) {
						result = around.advice.apply(this, targetArgs);
					} else {
						result = orig.apply(this, targetArgs);
						callAdvice(on, this, targetArgs);
					}
					
				} catch(e) {
					// If an exception was thrown, save it as the result,
					// and switch to afterThrowing
					result = e;
					afterType = afterThrowing;

				}

				callAdvice(afterType, this, [result]);					

				// TODO: Is it correct to pass original arguments here or
				// return result?  What if exception occurred?  Should result
				// then be the exception?
				
				// Always call "after", regardless of success return or exception.
				callAdvice(after, this, targetArgs);

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

						function proceed() {
							var result = aroundee.apply(self, args);
							callAdvice(on, self, args);
						}

						adviceFunc.call(self, { args: args, target: self, proceed: proceed });
					};
				}
			};			
		}
		
		return advised._advisor;
	}

	function addAdvice(target, func, type, adviceFunc) {
		var advisor = getAdvisor(target, func);

		advisor[type](adviceFunc);

		return advisor;
	}
	
	function add(object, func, aspect, /* Optional */ adviceFunc) {
		var adviceType = typeof aspect;
		
		if(adviceType == 'string') {
			// Advice is a string, adviceFunc must be supplied
			if(typeof adviceFunc != 'function') {
				throw new Error('if advice is a string, 4th param must be an advice function');
			}
			
			// Add single advice
			addAdvice(object, func, aspect, adviceFunc);
			
		} else if (adviceType == 'object') {
			// Advice is an object, and should have keys for advice types,
			// whose values are the function to use.
			
			// First, get the advisor for this object/func pair
			var advisor = getAdvisor(object, func);
			
			// Register all advices with the advisor
			for(var a in aspect) {
				advisor[a](aspect[a]);
			}
			
		} else {
			// Invalid param type
			throw new Error('advice must be a string or object');
			
		}
	}
	
	// Public API
	return {
		add: add
	};

});
})(typeof define != 'undefined' ? define : function(deps, factory){
    // global aop, if not loaded via require
    this.aop = factory();
});