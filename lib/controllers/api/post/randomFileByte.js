module.exports = function(req, res){
	var b = req.body.b,
		a = [],
		rand = gen.create();
	if (isNaN(parseFloat(b)) || !isFinite(b)) return res(400);
	if (b > 5 * 1024 * 1024 || b < 0) return res(400);
	for (var i = 0; i < b; i++) {
		a.push(rand(8));
	};

	res.send(200, {
		file: new Buffer(a).toString('base64')
	});
}