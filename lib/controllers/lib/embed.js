var fs = require('fs'),
	colorTools = require('./colorTools'),
    Algorithms = require('./Algorithms'),
    _ = require('lodash'),
    gen = require('random-seed'),
    async = require('async');

module.exports = function(image, infoData, algorithm, fail, seed, callback, control){

	var algorithm       = Algorithms(algorithm),
		infoBlockLength = algorithm.infoBlockLength,
		info            = infoData.data;

	var assignment;

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

	function flip(start, diff) {
    	assignment.flipIndexAddValue(start + diff[0], diff[1]);
    }

	//console.log('Assignment completed')

	var pixelBlocks = assignment.pixelBlocks(algorithm.blockLength);

	//console.log('Blocks built')

	var max_infoLength_inBits  = pixelBlocks.length * infoBlockLength,
		max_infoLength_inBytes = max_infoLength_inBits >>> 3,

		numberOfBlocks_max_infoLength_inBytes = Math.ceil(max_infoLength_inBytes.toString(2).length/infoBlockLength),

		binaryLength_max_infoLength_inBytes = numberOfBlocks_max_infoLength_inBytes * infoBlockLength,
		availableSpace_ForEmbedding         = max_infoLength_inBytes - binaryLength_max_infoLength_inBytes - 4;

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

    //console.log('Max info length: ' + availableSpace_ForEmbedding + ' b');

	var info_BytesLengh = infoData.bytesLength;
	console.log(info_BytesLengh);
	for (var i = numberOfBlocks_max_infoLength_inBytes; i > 0; i--) {
		info.unshift( info_BytesLengh ^ ((info_BytesLengh >>> 4) << 4) );
		info_BytesLengh = info_BytesLengh >>> 4;
	};

	//console.log('Info length inserted');

	function pack(){
		//console.log('Embedding completed')

	    assignment.repack();

	    //console.log('Image repacked')

	    callback(image.pack());
	}

    switch(algorithm.method){
		case 'MODULE':
		default: embed_MODULE(pixelBlocks, info, algorithm, flip, seed, pack, fail, control);
		break;
	}
}

/*
pixelBlocks = [ { block, start }];
*/

function embed_MODULE(pixelBlocks, info, algorithm, flip, seed, callback, fail, control){

	if (seed){
	
		//seed = seed || "Copyright 2014 Nguyen Tuan Anh";
		
		var rand = gen.create(seed);
		//console.log('Random generator created');

		var m = pixelBlocks.length, i, j=0, t;

		// While there remain elements to shuffle…
		while (m && j < info.length) {
		    // Pick a remaining element…
			i = rand(m--);

		    // And swap it with the current element.
		    t = pixelBlocks[m];
		    pixelBlocks[m] = pixelBlocks[i];
		    pixelBlocks[i] = t;

		    j++;
		}
		//console.log('Blocks shuffled');

	}

	var previnf;

	for (i = 0, l = pixelBlocks.length; i < l; i++) {
    	var b = pixelBlocks[i],
    		bp = pixelBlocks[i-1],
    		bn = pixelBlocks[i+1],
    		bpl = false,
    		bl = b.block,
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
	    		for (var i1 = 0, l1 = bl.length - 1; i1 < l1; i1++) {
		    		if (bl[i1] != bl[i1+1]) {
		    			notskip = true;
		    			break;
		    		}
		    	};
		    }

	    } else {
	    	notskip = true;
	    }

    	if (notskip) {
    		notskip = false;
    		var	inf = info.shift(),
	    		diffVal = algorithm.value(b.block) ^ inf;

	    	if (diffVal !== 0) {
	    		var diff = algorithm.reverse(diffVal);
	    		if ( _.isArray(diff[0]) ) {
	    			for (var j = 0; j < diff.length; j++) {
	    				flip(b.start, diff[j]);
	    			};
	    		} else {
	    			if (control) {
	    				bl[diff[0]] = bl[diff[0]] ^ diff[1]; 
			    		for (var i1 = 0, l1 = bl.length - 1; i1 < l1; i1++) {
				    		if (bl[i1] != bl[i1+1]) {
				    			notskip = true;
				    			break;
				    		}
				    	};
				    } else {
				    	notskip = true;
				    }
				    flip(b.start, diff);
				    b.block[diff[0]] = b.block[diff[0]]^diff[1];
				    if (!notskip) {
				    	//console.log(1);
				    	info.unshift(inf);
				    	if (previnf) info.unshift(previnf);
				    	previnf = false;
				    } else {
				    	previnf = inf;
				    }
	    		}
	    	}
    	}
    };
    if (info.length) fail('Failed');
    else callback();

    // //console.log('Info embedded');
}