var fs = require('fs'),
	colorTools = require('./colorTools'),
    Algorithms = require('./Algorithms')
    coverImageParse = require('./coverImageParse'),
    _ = require('lodash'),
    gen = require('random-seed');

module.exports = function(image, algorithm, seed, control){
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
			return export_MODULE(pixelBlocks, algorithm, numberOfBlocks_max_infoLength_inBytes, seed, control);
		break;
	}
}

function export_MODULE(pixelBlocks, algorithm, numberOf_InfoBlocks, seed, control){

	var m = pixelBlocks.length, i;

	if (seed){
		//seed = seed || "Copyright 2014 Nguyen Tuan Anh";

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
	}

	var numberOfBlocks = 0,
		value = algorithm.value,
		pixelBlocksprev;

	function extract(x){
		var b = pixelBlocks.shift(),
			block = b.block,
			bp = pixelBlocksprev,
    		bn = pixelBlocks[0],
    		bpl = false,
    		notskip = false,
    		bnl = false;

    	if (bn) bnl = bn.block;
    	if (bp) bpl = bp.block;

		if (control) {
			if (bpl)
    		for (var i1 = 0, l1 = bpl.length - 1; i1 < l1; i1++) {
	    		if (bpl[i1] != bpl[i1+1]) {
	    			notskip = true;
	    			break;
	    		}
	    	};
	    	if (notskip && bnl) {
	    		notskip = false;
	    		for (var i1 = 0, l1 = bnl.length - 1; i1 < l1; i1++) {
		    		if (bnl[i1] != bnl[i1+1]) {
		    			notskip = true;
		    			break;
		    		}
		    	};
		    }
		    if (notskip) {
		    	notskip = false;
	    		for (var i1 = 0, l1 = block.length - 1; i1 < l1; i1++) {
		    		if (block[i1] != block[i1+1]) {
		    			notskip = true;
		    			break;
		    		}
		    	};
		    }
		    pixelBlocksprev = b;
		    if (notskip) return (x << 4) ^ value(block);
	    	else return extract(x);
	    } else {
	    	return (x << 4) ^ value(block);
	    }
	}

	for (i = 0; i < numberOf_InfoBlocks; i++) {
		numberOfBlocks = extract(numberOfBlocks);
	}

	console.log(numberOfBlocks);

	// What extracted is info bytes size, we need the real number of blocks
	numberOfBlocks = (numberOfBlocks << 3) / algorithm.infoBlockLength;
	var info = [], b = 0, count = 0;
	for (i = 0; i < numberOfBlocks; i++) {
		b = extract(b);
		if (count++ === 1) {
			info.push(b);
			count = b = 0;
		}
	}
	//console.log('ha');
	var ext = new Buffer(info.splice(0, 4)).toString('utf8');
	if (ext === '0000') ext = '';
	else ext = '.'+ext.substring(0, ext.indexOf('.'));
	//console.log(ext);

	return {
		buffer: new Buffer(info),
		ext: ext
	}
}