var fs = require('fs'),
	colorTools = require('./colorTools'),
    Algorithms = require('./Algorithms')
    coverImageParse = require('./coverImageParse'),
    embedInfoParse = require('./embedInfoParse'),
    _ = require('lodash'),
    gen = require('random-seed');

module.exports = function(image, infoData, algorithm, fail, seed){

	if (image.palette.length === 0) {
		fail({
	    	message: 'NOT_PALETTED',
		});
		return null;
	}

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
		info_BytesLengh;

	switch(algorithm.assignmentMethod){
		case 'RING':
		default:
		assignment = colorTools.ringAssignment(image);
		break;
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

    function flip(start, diff){
    	assignment.flipIndexAddValue(start + diff[0], diff[1]);
    }

    switch(algorithm.method){
		case 'MODULE':
		default: embed_MODULE(pixelBlocks, info, algorithm, flip, assignment, seed);
		break;
	}
	console.log('Embedding completed')

    assignment.repack();

    console.log('Image repacked')

    return image.pack();
}

function embed_MODULE(pixelBlocks, info, algorithm, flip, assignment, seed){
	var rand, pbs = [], l = pixelBlocks.length, i;
	
	if (seed) {
		rand = gen.create(seed);
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