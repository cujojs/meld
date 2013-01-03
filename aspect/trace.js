/**
 * trace
 * @author: brian@hovercraftstudios.com
 */
(function(define) {
define(function(require) {

	var meld, joinpoint, padding, simpleReporter;

	meld = require('../meld');
	joinpoint = meld.joinpoint;

	// Padding characters for indenting traces
	padding =  '........';

	// 2^12 padding = 4096. If you need more stack than that,
	// you probably have bigger problems!
	for(var i=0; i<9; i++) {
		padding += padding;
	}

	simpleReporter = {
		enter: function(info, depth) {
			console.log(indent(depth) + info.method, 'CALL', info.args);
		},
		success: function(info, depth) {
			console.log(indent(depth) + info.method, 'RETURN', info.result);
		},
		fail: function(info, depth) {
			console.warn(indent(depth) + info.method, 'THROW', info.exception);
		}
	};

	return {
		createAspect: createTraceAspect,
		publicMethods: /^[^_]/,
		allMethods: /.+/
	};

	function createTraceAspect(reporter) {
		var depth;

		depth = 0;

		if(!reporter) {
			reporter = simpleReporter;
		}

		return {
			before: function() {
				// Always increase depth
				depth += 1;
				reporter.enter && reporter.enter(joinpoint(), depth);
			},

			afterReturning: function() {
				reporter.success && reporter.success(joinpoint(), depth);
			},

			afterThrowing: function() {
				reporter.fail && reporter.fail(joinpoint(), depth);
			},

			after: function() {
				// Always decrease depth
				depth -= 1;
			}
		};
	}

	function indent(depth) {
		return padding.slice(0, depth-1);
	}

});
}(typeof define === 'function' ? define : function(factory) { module.exports = factory(require); }));
