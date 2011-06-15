
// TODO:
// 1. Strategy for removing advice
(function(define, undef) {
define([], function() {

	function callAdvice(advices, target, args) {
		var i, advice;

		i = advices.length;

		while((advice = advices[--i])) {
			advice.apply(target, args);
		}
	}

	function makeAdviceList(advices, order) {
		return function(advice) {
			order.call(advices, advice);
		};
	}

	function addAdvice(target, func, type, adviceFunc) {
		var advised = target[func];
		
		if(!advised._advisor) {
			var before, afterReturning, afterThrowing, after, around, advisor, interceptor;

			before = [];
			after  = [];
			afterReturning  = [];
			afterThrowing   = [];
			around = {};

			// Intercept calls to the original function, and invoke
			// all currently registered before, around, and after advices
			interceptor = target[func] = function() {
				var targetArgs, result, afterType;

				targetArgs = argsToArray(arguments);
				afterType = afterReturning;

				// Befores
				callAdvice(before, this, targetArgs);
				
				// Call around if registered.  If not call original
				try {
					result = (around.advice||advised).apply(this, targetArgs);

				} catch(e) {
					result = e;
					afterType = afterThrowing;

				}

				callAdvice(afterType, this, [result]);					

				// TODO: Is it correct to pass original arguments here or
				// return result?  What if exception occurred?  Should result
				// then be the exception?
				callAdvice(after, this, targetArgs);

				return result;
			};

			interceptor._advisor = {
				before: makeAdviceList(before, ap.unshift),
				after:  makeAdviceList(after, ap.push),
				afterReturning: makeAdviceList(afterReturning, ap.push),
				afterThrowing:  makeAdviceList(afterThrowing, ap.push),
				around: function(f) {
					around.advice = function() {
						var args, self;
						args = argsToArray(arguments);
						self = this;

						function proceed() {
							return advised.apply(self, args);
						}

						f.call(self, { args: args, target: self, proceed: proceed });
					};
				}
			};
		}

		advised._advisor[type](adviceFunc);

		return advised._advisor;
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