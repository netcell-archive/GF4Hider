var fs = require('fs'),
	colorTools = require('./colorTools'),
    Algorithms = require('./Algorithms')
    coverImageParse = require('./coverImageParse'),
    _ = require('lodash'),
    gen = require('random-seed');

module.exports = function(image, algorithm, seed){
	var algorithm = Algorithms(algorithm),
		infoBlockLength = algorithm.infoBlockLength;

	var assignment;

	switch(algorithm.assignmentMethod){
		case 'RING':
		default:
		if (image.palette.length === 0) {
			var R = [], G = [], B = [], data = image.data, l = data.length;
		    for (var i = 0; i < l; i += 4) {
		        R.push( ( (data[i  ]>>>2) << 2 ) ^ data[i  ] );
		        G.push( ( (data[i+1]>>>2) << 2 ) ^ data[i+1] );
		        B.push( ( (data[i+2]>>>2) << 2 ) ^ data[i+2] );
		    }
		    var pixels = R.concat(G,B);
			assignment = {
				pixelBlocks: function(){
					return colorTools.buildBlocksFromArray(algorithm.blockLength, pixels);
				},
			};
		} else {
			assignment = colorTools.ringAssignment(image);
		}
		break;
	}

	var pixelBlocks = assignment.pixelBlocks(algorithm.blockLength),
	
		max_infoLength_inBits  = pixelBlocks.length * infoBlockLength,
		max_infoLength_inBytes = max_infoLength_inBits >>> 3,

		numberOfBlocks_max_infoLength_inBytes = Math.ceil(max_infoLength_inBytes.toString(2).length/infoBlockLength);

    switch(algorithm.method){
		case 'MODULE':
		default: 
			return export_MODULE(pixelBlocks, algorithm, numberOfBlocks_max_infoLength_inBytes, seed);
		break;
	}
}

function export_MODULE(pixelBlocks, algorithm, numberOf_InfoBlocks, seed){

	var m = pixelBlocks.length, i;

	seed = seed || "Copyright 2014 Nguyen Tuan Anh";

	var rand = gen.create(seed);
	console.log('Random generator created');

	  // While there remain elements to shuffle…
	  while (m) {

	    // Pick a remaining element…
	    i = rand(m--);

	    // And swap it with the current element.
	    t = pixelBlocks[m];
	    pixelBlocks[m] = pixelBlocks[i];
	    pixelBlocks[i] = t;
	  }
	console.log('Blocks shuffled');

	var numberOfBlocks = 0,
		value = algorithm.value;

	function extract(x){
		var block = pixelBlocks.pop().block;
		return (x << 4) ^ value(block);
	}

	for (i = 0; i < numberOf_InfoBlocks; i++) {
		numberOfBlocks = extract(numberOfBlocks);
	}

	// What extracted is info bytes size, we need the real number of blocks
	numberOfBlocks = (numberOfBlocks << 3) / algorithm.infoBlockLength;
	console.log(numberOfBlocks);

	var info = [], b = 0, count = 0;
	for (i = 0; i < numberOfBlocks; i++) {
		b = extract(b);
		if (count++ === 1) {
			info.push(b);
			count = b = 0;
		}
	}

	return new Buffer(info);
}