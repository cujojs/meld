(function(buster, meld, trace) {
'use strict';

var assert, refute, sentinel;

assert = buster.assert;
refute = buster.refute;

sentinel = {};

buster.testCase('aspect/trace', {

	'should call enter upon entering advised method': function() {
		var spy, advised, reporter;

		spy = this.spy();
		advised = { method: spy };
		reporter = { enter: this.spy() };

		meld.add(advised, 'method', trace.createAspect(reporter));

		advised.method(sentinel);

		assert.calledOnceWith(spy, sentinel);
		assert.calledOnce(reporter.enter);
	},

	'should call success upon returning from advised method': function() {
		var advised, reporter;

		advised = {
			method: function() { refute.called(reporter.success); }
		};
		reporter = { success: this.spy() };

		meld.add(advised, 'method', trace.createAspect(reporter));

		advised.method();

		assert.calledOnce(reporter.success);
	},

	'should call fail upon throwing from advised method': function() {
		var advised, reporter;

		advised = {
			method: function() {
				refute.called(reporter.fail);
				throw sentinel;
			}
		};
		reporter = { fail: this.spy() };

		meld.add(advised, 'method', trace.createAspect(reporter));

		assert.exception(function() {
			advised.method();
			assert.calledOnce(reporter.fail);
		});
	}

});

})(
	require('buster'),
	require('../../meld'),
	require('../../aspect/trace')
);