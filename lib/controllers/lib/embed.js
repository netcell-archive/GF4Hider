var fs = require('fs'),
	colorTools = require('./colorTools'),
    Algorithms = require('./Algorithms'),
    coverImageParse = require('./coverImageParse'),
    embedInfoParse = require('./embedInfoParse'),
    _ = require('lodash'),
    gen = require('random-seed');

module.exports = function(image, infoData, algorithm, fail, seed){

	var algorithm       = Algorithms(algorithm),
		infoBlockLength = algorithm.infoBlockLength,
		info            = infoData.data;

	var assignment,
		pixelBlocks,
		max_infoLength_inBits,
		max_infoLength_inBytes,
		numberOfBlocks_max_infoLength_inBytes,
		binaryLength_max_infoLength_inBytes,
		availableSpace_ForEmbedding,
		info_BytesLengh,
		flip;

	switch(algorithm.assignmentMethod){
		case 'RING':
		default:
		if (image.palette.length === 0) {
			var R = [], G = [], B = [], data = image.data, l = data.length, l4 = l/4;
		    for (var i = 0; i < l; i+=4) {
		        R.push( ( (data[i  ]>>>2) << 2 ) ^ data[i  ] );
		        G.push( ( (data[i+1]>>>2) << 2 ) ^ data[i+1] );
		        B.push( ( (data[i+2]>>>2) << 2 ) ^ data[i+2] );
		    }
		    var pixels = R.concat(G,B);
		    console.log(pixels.length);
			assignment = {
				pixelBlocks: function(){
					return colorTools.buildBlocksFromArray(algorithm.blockLength, pixels);
				},
				flipIndexAddValue: function(pos, addValue){
					var cpos = 0;
					if (pos >= 2*l4) { //Flip B
						pos = pos - 2*l4;
						cpos = 2;
					} else if (pos >= l4) { //Flip G
						pos = pos - l4;
						cpos = 1;
					}
					pos = pos * 4;
					data[pos+cpos] = data[pos+cpos] ^ addValue;
				},
				repack: function(){
					image.data = data;
				}
			};
		} else {
			assignment = colorTools.ringAssignment(image);
		}
		break;
	}

	flip = function(start, diff){
    	assignment.flipIndexAddValue(start + diff[0], diff[1]);
    }

	console.log('Assignment completed')

	pixelBlocks = assignment.pixelBlocks(algorithm.blockLength);

	console.log('Blocks built')

	max_infoLength_inBits  = pixelBlocks.length * infoBlockLength;
	max_infoLength_inBytes = Math.floor(max_infoLength_inBits/8);

	numberOfBlocks_max_infoLength_inBytes = Math.ceil(max_infoLength_inBytes.toString(2).length/infoBlockLength);

	binaryLength_max_infoLength_inBytes = numberOfBlocks_max_infoLength_inBytes * infoBlockLength;
	availableSpace_ForEmbedding         = max_infoLength_inBytes - binaryLength_max_infoLength_inBytes;

	if (infoData.bytesLength > availableSpace_ForEmbedding) {
    	fail({
	    	message: 'INFO_TOO_LONG',
	    	data: {
	    		numberOfBlocks_infoLength: numberOfBlocks_max_infoLength_inBytes,
	    		numberOfBlocks_available: pixelBlocks.length - numberOfBlocks_max_infoLength_inBytes,
	    		maxInfoLength: availableSpace_ForEmbedding
	    	}
	    });
	    return null;
    }

    console.log('Max info length: ' + availableSpace_ForEmbedding + ' b');

	info_BytesLengh = infoData.bytesLength;
	for (var i = numberOfBlocks_max_infoLength_inBytes; i >0 ; i--) {
		info.unshift( info_BytesLengh ^ ((info_BytesLengh >>> 4) << 4) );
		info_BytesLengh = info_BytesLengh >>> 4;
	};

	console.log('Info length inserted');

    switch(algorithm.method){
		case 'MODULE':
		default: embed_MODULE(pixelBlocks, info, algorithm, flip, seed);
		break;
	}
	console.log('Embedding completed')

    assignment.repack();

    console.log('Image repacked')

    return image.pack();
}

/*
pixelBlocks = [ { block, start }];
*/

function embed_MODULE(pixelBlocks, info, algorithm, flip, seed){
	var rand, pbs = [], l = pixelBlocks.length, i;
	
	if (seed) {
		rand = gen.create(seed);
		console.log('Random generator created');
		for (i = 0; i < l; i++) pbs.push( pixelBlocks.splice(rand(pixelBlocks.length),1)[0] );
		console.log('Blocks shuffled');
	} else pbs = pixelBlocks.slice();

	console.log('Blocks prepared');

	for (var i = 0; i < info.length; i++) {
    	var FW      = algorithm.value(pbs[i].block),
    		diffVal = FW ^ info[i];

    	if (diffVal !== 0) {
    		var diff = algorithm.reverse(diffVal);
    		if ( _.isArray(diff[0]) ) {
    			for (var j = 0; j < diff.length; j++) {
    				flip(pbs[i].start, diff[j]);
    			};
    		} else flip(pbs[i].start, diff);
    	}
    };

    console.log('Info embedded');
}