(function(buster, meld, createTracer) {
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
		reporter = { onCall: this.spy() };

		meld(advised, 'method', createTracer(reporter));

		advised.method(sentinel);

		assert.calledOnceWith(spy, sentinel);
		assert.calledOnce(reporter.onCall);
	},

	'should call success upon returning from advised method': function() {
		var advised, reporter;

		advised = {
			method: function() { refute.called(reporter.onReturn); }
		};
		reporter = { onReturn: this.spy() };

		meld(advised, 'method', createTracer(reporter));

		advised.method();

		assert.calledOnce(reporter.onReturn);
	},

	'should call fail upon throwing from advised method': function() {
		var advised, reporter;

		advised = {
			method: function() {
				refute.called(reporter.onThrow);
				throw sentinel;
			}
		};
		reporter = { onThrow: this.spy() };

		meld(advised, 'method', createTracer(reporter));

		assert.exception(function() {
			advised.method();
			assert.calledOnce(reporter.onThrow);
		});
	}

});

})(
	require('buster'),
	require('../../meld'),
	require('../../aspect/trace')
);