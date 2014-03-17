var socketio = require('socket.io'),
	io = function(server){
		io = socketio.listen(server);
		io.set('log level', 1);
	};

module.exports = io;