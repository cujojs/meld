(function(buster, meld) {
'use strict';

var assert, refute;

assert = buster.assert;
refute = buster.refute;

buster.testCase('pointcuts', {

	'string should specify exact method name': function() {
		var target, method1, method2, before;

		target = {
			method1: (method1 = this.spy()),
			method2: (method2 = this.spy())
		};

		before = this.spy();

		meld(target, 'method1', {
			before: before
		});

		target.method1();
		assert.calledOnce(before);
		assert.calledOnce(method1);
		refute.called(method2);

		target.method2();
		refute.calledTwice(before);
		assert.calledOnce(method2);
	},

	'array should specify exact list of method names': function() {
		var target, method1, method2, method3, before;

		target = {
			method1: (method1 = this.spy()),
			method2: (method2 = this.spy()),
			method3: (method3 = this.spy())
		};

		before = this.spy();

		meld(target, ['method1', 'method3'], {
			before: before
		});

		target.method1();
		assert.calledOnce(before);
		assert.calledOnce(method1);
		refute.called(method2);

		target.method2();
		refute.calledTwice(before);
		assert.calledOnce(method2);

		target.method3();
		assert.calledTwice(before);
		assert.calledOnce(method3);

	},

	'regex should specify match method names': function() {
		var target, method1, method2, method3, before;

		target = {
			method1: (method1 = this.spy()),
			method2: (method2 = this.spy()),
			method3: (method3 = this.spy())
		};

		before = this.spy();

		meld(target, /method[13]/, {
			before: before
		});

		target.method1();
		assert.calledOnce(before);
		assert.calledOnce(method1);
		refute.called(method2);

		target.method2();
		refute.calledTwice(before);
		assert.calledOnce(method2);

		target.method3();
		assert.calledTwice(before);
		assert.calledOnce(method3);

	},

	'function should specify list of exact method names': function() {
		var target, method1, method2, method3, before;

		target = {
			method1: (method1 = this.spy()),
			method2: (method2 = this.spy()),
			method3: (method3 = this.spy())
		};

		before = this.spy();

		meld(target,
			function() {
				return ['method1', 'method3'];
			},
			{
				before: before
			});

		target.method1();
		assert.calledOnce(before);
		assert.calledOnce(method1);
		refute.called(method2);

		target.method2();
		refute.calledTwice(before);
		assert.calledOnce(method2);

		target.method3();
		assert.calledTwice(before);
		assert.calledOnce(method3);

	}

});

})(
	this.buster || require('buster'),
	this.meld || require('../meld')
);