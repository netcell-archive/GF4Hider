var ALGORITHMS = {
	'F2'    : './F2',
	'F2Weak': './F2Weak'
};

module.exports = function(algo){
	return require(ALGORITHMS[algo]);
}