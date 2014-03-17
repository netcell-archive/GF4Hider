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
	var fl = F.length,
		result = 0;

	if (fl !== wl) throw new Error();
	else for (var i = 0; i < fl; i++) {
		result = result ^ (multiplyTable[ W[i] ][ F[i] ]);
	}
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