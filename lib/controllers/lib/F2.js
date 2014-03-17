var multiplyTable = [];
multiplyTable[1 ] = [0 , 1 , 2 , 3 ];
multiplyTable[4 ] = [0 , 4 , 8 , 12];
multiplyTable[7 ] = [0 , 7 , 9 , 14];
multiplyTable[10] = [0 , 10, 15, 5 ];
multiplyTable[13] = [0 , 13, 6 , 11];

var reverseTable = [
	null,
	[0 , 1], [0 , 2], [0 , 3],
	[1 , 1], [3 , 3], [4 , 2],
	[2 , 1], [1 , 2], [2 , 2],
	[3 , 1], [4 , 3], [1 , 3],
	[4 , 1], [2 , 3], [3 , 2],
];
var P = [1, 2, 3, 4,  5 ]
var W = [1, 4, 7, 10, 13],
	wl = 5;

function multiply(F){
	var result = 0;

	result = result ^ (multiplyTable[ W[0] ][ F[0] ])
				    ^ (multiplyTable[ W[1] ][ F[1] ])
				    ^ (multiplyTable[ W[2] ][ F[2] ])
				    ^ (multiplyTable[ W[3] ][ F[3] ])
				    ^ (multiplyTable[ W[4] ][ F[4] ]);

	return result;
}

function reverse(x){
	return reverseTable[x];
}

module.exports = {
	method: 'MODULE',
	value: multiply,
	reverse: reverse,
	blockLength: wl,
	infoBlockLength: 4,
	assignmentMethod: 'RING'
};