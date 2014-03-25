var _ = require('lodash'),
	dataurl = require('dataurl'),
	archiver = require('archiver'),
	streamBuffers = require('stream-buffers');

module.exports = function(input, name, callback){

	var buffer = dataurl.parse(input).data;//,
	// 	output = new streamBuffers.WritableStreamBuffer();

	// if ( _.isUndefined(buffer) ) buffer = new Buffer(input);

	// output.on('close', function(){
        var data = [];
		
		//buffer = output.getContents();
		for (var i = 0, l = buffer.length; i < l; i++) {
			var b = buffer.readUInt8(i);
				data.push(b >>> 4);
				data.push(b ^ ((b >>> 4) << 4));
		};
		
		callback ({
			data: data,
			bytesLength: buffer.length,
			length: data.length
		});
 //    });

	// var archive = archiver('zip');
	// 	archive.pipe(output);
	// 	archive.append(buffer, {name: name}).finalize();
}