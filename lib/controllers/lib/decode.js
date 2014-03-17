var fs = require('fs'),
	colorTools = require('./colorTools'),
    Algorithms = require('./Algorithms')
    coverImageParse = require('./coverImageParse'),
    _ = require('lodash');

module.exports = function(image, algorithm){
		var algorithm = Algorithms(algorithm),
			infoBlockLength = algorithm.infoBlockLength;

		var assignment,
			pixelBlocks,
			max_infoLength_inBits,
			max_infoLength_inBytes,
			numberOfBlocks_max_infoLength_inBytes;

		switch(algorithm.assignmentMethod){
			case 'RING':
			default:
			assignment = colorTools.ringAssignment(image);
			break;
		}

		pixelBlocks = assignment.pixelBlocks(algorithm.blockLength);
		
		max_infoLength_inBits  = pixelBlocks.length * infoBlockLength;
		max_infoLength_inBytes = Math.floor(max_infoLength_inBits/8);

		numberOfBlocks_max_infoLength_inBytes = Math.ceil(max_infoLength_inBytes.toString(2).length/infoBlockLength);

	    switch(algorithm.method){
			case 'MODULE':
			default: 
				var buffer = export_MODULE(pixelBlocks, algorithm, numberOfBlocks_max_infoLength_inBytes);
			break;
		}

	    return buffer;
}

function export_MODULE(pixelBlocks, algorithm, numberOf_InfoBlocks){
	var numberOfBlocks = 0, b = 0, count = 0;
	var value = algorithm.value;

	function extract(x){
		var block = pixelBlocks.shift().block;
		return (x << 4) ^ value(block);
	}

	for (var i = 0; i < numberOf_InfoBlocks; i++) {
		numberOfBlocks = extract(numberOfBlocks);
	}

	var buffer = new Buffer(numberOfBlocks), offset = 0;
	// What extracted is info bytes size, we need the real number of blocks
	numberOfBlocks = (numberOfBlocks * 8) / algorithm.infoBlockLength;

	var info = [];
	for (var i = 0; i < numberOfBlocks; i++) {
		info.push( value(pixelBlocks[i].block) );
	}

	for (var i = 0; i < numberOfBlocks; i++) {
		b = (b << 4) ^ info[i];
		if (count++ === 1) {
			buffer.writeUInt8(b, offset++);
			count = b = 0;
		}
	}

	return buffer;
}