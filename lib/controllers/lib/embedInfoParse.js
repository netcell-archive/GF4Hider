var _ = require('lodash'),
	dataurl = require('dataurl'),
	archiver = require('archiver'),
	streamBuffers = require('stream-buffers');

var extpatt = /\.([0-9a-z]+)(?:[\?#]|$)/i;
var maxextlength = 4;

module.exports = function(input, name, callback){

	var buffer = dataurl.parse(input).data;//,
	// 	output = new streamBuffers.WritableStreamBuffer();

	// if ( _.isUndefined(buffer) ) buffer = new Buffer(input);

	// output.on('close', function(){
        var data = [], ext = name.match(extpatt);

        if (ext === null || ext[1].length > maxextlength) {
        	data = [3,0,3,0,3,0,3,0]; //'0000'
        } else {
        	ext[1] = ext[1] + new Array(maxextlength - ext[1].length + 1).join('.');
        	var buff = new Buffer(ext[1]);
        	for (var i = 0; i < maxextlength; i++) {
        		var b = buff[i];
        			data.push(b >>> 4);
					data.push(b ^ ((b >>> 4) << 4));
        	};
        }
		
		//buffer = output.getContents();
		for (var i = 0, l = buffer.length; i < l; i++) {
			var b = buffer[i];
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