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
		reporter = { called: this.spy() };

		meld.add(advised, 'method', createTracer(reporter));

		advised.method(sentinel);

		assert.calledOnceWith(spy, sentinel);
		assert.calledOnce(reporter.called);
	},

	'should call success upon returning from advised method': function() {
		var advised, reporter;

		advised = {
			method: function() { refute.called(reporter.returned); }
		};
		reporter = { returned: this.spy() };

		meld.add(advised, 'method', createTracer(reporter));

		advised.method();

		assert.calledOnce(reporter.returned);
	},

	'should call fail upon throwing from advised method': function() {
		var advised, reporter;

		advised = {
			method: function() {
				refute.called(reporter.threw);
				throw sentinel;
			}
		};
		reporter = { threw: this.spy() };

		meld.add(advised, 'method', createTracer(reporter));

		assert.exception(function() {
			advised.method();
			assert.calledOnce(reporter.threw);
		});
	}

});

})(
	require('buster'),
	require('../../meld'),
	require('../../aspect/trace')
);