(function() {

	var config = {};

	config['meld:node'] = {
		environment: 'node',
		tests: ['*.js']
	};

	config['meld:browser'] = {
		environment: 'browser',
		rootPath: '../',
		sources: ['meld.js'],
		tests: ['test/*.js']
	};

	if(typeof module != 'undefined') {
		module.exports = config;
	}

})();