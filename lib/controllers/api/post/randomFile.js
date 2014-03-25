module.exports = function(req, res){
	var kb = req.body.kb,
		b = kb * 1024,
		a = [],
		rand = gen.create();
	if (isNaN(parseFloat($scope.s.random_size)) || !isFinite($scope.s.random_size)) return res(400);
	if (kb > 5 * 1024 || kb < 0) return res(400);
	for (var i = 0; i < b; i++) {
		a.push(rand(8));
	};

	res.send(200, {
		file: new Buffer(a).toString('base64')
	});
}