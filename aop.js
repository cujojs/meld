
// TODO:
// 1. Strategy for removing advice
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
			var orig, before, afterReturning, afterThrowing, after, around, advisor;

			// Save the original, not-yet-advised function
			orig = advised;
			
			before = [];
			after  = [];
			afterReturning  = [];
			afterThrowing   = [];
			around = {};

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
					result = (around.advice||orig).apply(this, targetArgs);

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
				before: makeAdviceAdd(before, prepend),
				after:  makeAdviceAdd(after, append),
				afterReturning: makeAdviceAdd(afterReturning, append),
				afterThrowing:  makeAdviceAdd(afterThrowing, append),
				around: function(adviceFunc) {
					around.advice = function() {
						var args, self;
						args = argsToArray(arguments);
						self = this;

						function proceed() {
							return orig.apply(self, args);
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
	
	function advice(object, func, advice, /* Optional */ adviceFunc) {
		var adviceType = typeof advice;
		
		if(adviceType == 'string') {
			if(typeof adviceFunc != 'function') {
				throw new Error('if advice is a string, 4th param must be an advice function');
			}
			
			// Add single advice
			addAdvice(object, func, advice, adviceFunc);
			
		} else if (adviceType == 'object') {
			// Advice is an object, and should have keys for advice types,
			// whose values are the function to use.
			for(var a in advice) {
				addAdvice(object, func, a, advice[a]);
			}
			
		} else {
			throw new Error('advice must be a string or object');
			
		}
	}
	
	// Public API
	return {
		add: advice
	};

});
})(typeof define != 'undefined' ? define : function(deps, factory){
    // global when, if not loaded via require
    this.aop = factory();
});