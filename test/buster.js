module.exports['meld:node'] = {
	environment: 'node',
	tests: ['*.js']
};

module.exports['meld:browser'] = {
	environment: 'browser',
	rootPath: '../',
	sources: ['meld.js'],
	tests: ['test/*.js']
};
