var _ = require('lodash'),
    RgbQuant = require('./RgbQuant'),
    Q = require('q');

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function rgbaToHex(color) {
    return rgbToHex(color[0], color[1], color[2]);
}

function hexToRgb(hex) {
    var bigint = parseInt(hex, 16);
    return [bigint >> 16 & 255, bigint >> 8 & 255, bigint & 255];
}

function hexToRgba(hex) {
    var bigint = parseInt(hex, 16);
    return [bigint >> 16 & 255, bigint >> 8 & 255, bigint & 255, 255];
}

function getPaletteIndex(color, palette){
    return palette.indexOf(color);
}

function getInversePaletteIndex(color, inversePalette){
    return inversePalette[color];
}

function buildInversePalette(palette){
    var result = {};
    for (var i = 0; i < palette.length; i++) {
        result[palette[i]] = i;
    };
    return result;
}

// Prepare blocks for steganography
function buildBlocksFromArray(blockLength, array){
    var numberOfBlocks = Math.floor(array.length/blockLength),
        result = [];
    for (var i = 0; i < numberOfBlocks; i++) {
        var start = i * blockLength;
        result.push ({
            start: start,
            block: array.slice( start, start + blockLength )
        });
    };
    return result;
}

function pixelIndicesFromHexInversePalette(hex, palette){
    var pixels = [];
    for (var i = 0, l = hex.length; i < l; i++) {
        pixels.push( getInversePaletteIndex(hex[i], palette) );
    }
    return pixels;
}

// Create an array contain values of pixels in assignment VALUE
function pixelValuesFromPixelsVALUE(pixels, VALUE){
    var pixelVALUES = [];
    for (var i = 0; i < pixels.length; i++) {
        pixelVALUES.push(VALUE[ pixels[i] ]);
    }
    return pixelVALUES;
}

// Create an array contain values of pixels in rgba data
function pixelsColorFromData(data){
    var pixels = [];
    for (var i = 0, l = data.length; i < l;) {
        var color = [ data[i++], data[i++], data[i++], data[i++] ];
        pixels.push(color);
    }
    return pixels;
}

function pixelsHexFromPixelsColor(pixelsColor){
    var pixels = [];
    for (var i = 0, l = pixelsColor.length; i < l; i++) {
        var color = rgbaToHex( pixelsColor[i] );
        pixels.push(color);
    }
    return pixels;
}

function pixelsHexFromData(data){
    var pixels = [];
    for (var i = 0, l = data.length; i < l;) {
        var color = rgbToHex( data[i++], data[i++], data[i++], data[i++] );
        pixels.push(color);
    }
    return pixels;
}

function paletteFromColorPixels(pixels){
    var palette = [];
    for (var i = 0, l = pixels.length; i < l; i++) {
        if (_.findIndex(palette, pixels[i]) === -1) {
            palette.push(pixels[i]);
        }
    };
    return palette;
}

function inversePaletteFromHexPixels(pixels){
    var palette = {}, index = 0;
    for (var i = 0; i < pixels.length; i++) {
        if ( _.isUndefined( getInversePaletteIndex(pixels[i], palette) ) ) {
            palette[pixels[i]] = index++;
        }
    };
    return palette;
}

function paletteFromInversePalette(inversePalette){
    var palette = [];
    for (var color in inversePalette){
        palette[ inversePalette[color] ] = color;
    }
    return palette;
}

function colorPaletteFromHexPalette(palette){
    var result = [];
    for (var i = 0, l = palette.length; i < l; i++) {
        result.push(hexToRgba(palette[i]));
    };
    return result;
}

function hexPaletteFromColorPalette(palette){
    var result = [];
    for (var i = 0, l = palette.length; i < l; i++) {
        result.push(rgbaToHex(palette[i]));
    };
    return result;
}

// Distance between two colors
function distance(color1, color2){
    var r = color1[0] - color2[0],
        g = color1[1] - color2[1],
        b = color1[2] - color2[2]
    return r*r + g*g + b*b;
}

function PSNR(data1, data2){
    if (data1.length !== data2.length) return null;
    else {
        var N = data1.length,
            result = 0,
            d;

        for (var i = 0; i < N; i++) {
            d = data1[i] - data2[i];
            result += d * d;
        };
        return 10 * Math.log( 255 * 255 * 3 * N / result ) / Math.LN10;
    }
}

// Map of distance values between colors on palette
// In form of row [i, j] = [ distance(i, j), j ]
function distanceMap(palette){
    var map = [], i = 0, l = palette.length;
    for (i = 0; i < l; i++) {
        map[i] = [];
        map[i][i] = [0, i];
    }
    var time = Date.now();
    for (i = 0; i < l; i++) {
        for (var j = i + 1; j < l; j++) {
            var d = distance(palette[i], palette[j]);
            map[i][j] = [d, j];
            map[j][i] = [d, i];
        }
    }
    return map;
}

// Map of distance values between colors on palette
// With each row sorted incrementally by distance
function distanceSortedMap(palette){
    var map = distanceMap(palette);
    for (var i = 0, l = palette.length; i < l; i++) {
        map[i].sort(function(left, right) {
              return left[0] < right[0] ? -1 : 1;
        });
    }
    return map;
}

function stringArrayShort(array){
    return array.slice(0, 10).join(',');
}

var UTILS = {
    PSNR: PSNR,
    getPaletteIndex: getPaletteIndex,
    buildBlocksFromArray: buildBlocksFromArray,
    pixelsColorFromData: pixelsColorFromData,
    pixelsHexFromData: pixelsHexFromData,
    pixelValuesFromPixelsVALUE: pixelValuesFromPixelsVALUE,
    paletteFromColorPixels: paletteFromColorPixels,
    distance: distance,
    distanceMap: distanceMap,
    distanceSortedMap: distanceSortedMap,

    ringAssignment: function(image){

        var data = image.data,
            colorPalette = image.palette,
            time = Date.now();
        console.log();

        console.log('Extracting colors...')
        var pixelsColor  = pixelsColorFromData(data);

        // if (colorPalette.length === 0){
        //     var _data = [], q = new RgbQuant();
        //     for (var i = 0; i < data.length; i++) {
        //         _data.push(data[i]);
        //     };
        //     q.sample(_data, image.width);
        //     colorPalette = q.palette(true);
        //     for (var i = 0; i < colorPalette.length; i++) {
        //         colorPalette[i][3] = 255;
        //     };
        //     image.palette = colorPalette;
        //     pixelsColor = pixelsColorFromData(q.reduce(_data));
        // }

        console.log('Color pixels: '+ stringArrayShort(pixelsColor));
        console.log('Time: '+(Date.now()-time)+ 'ms'); time = Date.now(); console.log();

        console.log('Converting rgba to hex...')
        var pixelsHex = pixelsHexFromPixelsColor(pixelsColor);
        console.log('Hex pixels: '+ stringArrayShort(pixelsHex));
        console.log('Time: '+(Date.now()-time)+ 'ms'); time = Date.now(); console.log();

        console.log('Converting palette...')
        var palette        = hexPaletteFromColorPalette(colorPalette);
            inversePalette = buildInversePalette(palette);

        console.log('Color Palette: '+ stringArrayShort(colorPalette));
        console.log('Hex Palette: '+ stringArrayShort(palette));
        console.log('Time: '+(Date.now()-time)+ 'ms'); time = Date.now(); console.log();
        
        console.log('Indexing pixels...')
        var pixels  = pixelIndicesFromHexInversePalette(pixelsHex, inversePalette);
        console.log('Pixels indexed: '+stringArrayShort(pixels));
        console.log('Time: '+(Date.now()-time)+ 'ms'); time = Date.now(); console.log();

        console.log('Calculating distance map...')
        var map     = distanceSortedMap(colorPalette);
        console.log('Distance calculated')
        console.log('Time: '+(Date.now()-time)+ 'ms'); time = Date.now(); console.log();

        var Ring = [0, 1, 2, 3],
            paletteLength = palette.length;

        var numberOfNotAssignedIndices = paletteLength,
            indicesToBeProcessed       = [];

        var VALUE = [0], NEXT = [];

        console.log();

        // Find next indices and assign them with values if needed
        // SHOULD BE RUN AGAINST i WHERE VALUE[i] EXIST FIRST
        function assign(i) {
            numberOfNotAssignedIndices--;

            VALUE[i] = VALUE[i] || 0; NEXT[i] = [];
            // list of values to assigned to next indices
            var valuesToAssigned = Ring.slice();
            valuesToAssigned.splice(VALUE[i], 1);
            
            var numberOfNotAssignedValues = valuesToAssigned.length,
                indicesToBeAssigned       = [],
                mapi  = map[i], j = 0; 

            while (numberOfNotAssignedValues > 0) {
                var mapij = mapi[j];
                if (mapij[0] !== 0) { // distance = 0
                    var jValue = VALUE[ mapij[1] ];

                    // Index does not have value
                    if ( _.isUndefined(jValue) ){ 
                        // remind to assign this one with values
                        indicesToBeAssigned.push(mapij[1]);
                        numberOfNotAssignedValues--;
                    // Index has already had value
                    } else {
                        // check if values is not assigned
                        var jId = valuesToAssigned.indexOf(jValue);
                        if (jId >= 0){
                            NEXT[i][jValue] = mapij[1];
                            valuesToAssigned.splice(jId, 1);
                            numberOfNotAssignedValues--;
                        }
                    }
                }

                j++;
            }

            // Assign values for the un-assigned recored values
            for (var k = 0, l = indicesToBeAssigned.length; k < l; k++) {

                var kValue = valuesToAssigned.pop(),
                    kIndex = indicesToBeAssigned[k];

                NEXT[i][kValue] = kIndex;
                VALUE[kIndex]   = kValue;

                indicesToBeProcessed.push(kIndex);
            }


            // process indices
            while (indicesToBeProcessed.length) assign( indicesToBeProcessed.pop() );
        }

        function find(){ // Find the index has NEXT not assigned
            for (var i = 0; i < paletteLength; i++) {
                if ( _.isUndefined(NEXT[i]) ) return i;
            };
        }

        console.log('Assigning values...')
        while ( numberOfNotAssignedIndices > 0 ) assign( find() );
        console.log('Time: '+(Date.now()-time)+ 'ms'); time = Date.now(); console.log();

        return ASSIGNMENT = {
            data: data,
            colorPalette: colorPalette,
            palette: palette,
            inversePalette: inversePalette,
            pixels: pixels,
            pixelsHex: pixelsHex,
            VALUE: VALUE,
            NEXT: NEXT,
            pixelVALUES: function(){
                return pixelValuesFromPixelsVALUE(pixels, VALUE);
            },
            // nextFromIndex: function(index, value){
            //     return NEXT[index][value];
            // },
            nextFromIndexAddValue: function(index, addValue){
                return NEXT[index][VALUE[index] ^ addValue];
            },
            // nextFromColor: function(color, value){
            //     return NEXT[ index(color) ][value];
            // },
            // nextFromColorAddValue: function(color, addValue){
            //     return this.nextFromIndexAddValue(index(color, palette), addValue);
            // },
            // flipIndex: function(pos, value){
            //     pixels[pos] = this.nextFromIndex(pixels[pos], value);
            // },
            flipIndexAddValue: function(pos, addValue){
                pixels[pos] = this.nextFromIndexAddValue(pixels[pos], addValue);
            },
            pixelBlocks: function(blockLength){
                return buildBlocksFromArray( blockLength, this.pixelVALUES() );
            },
            repack: function(){
                var buffer = new Buffer(data.length);
                var offset = 0;
                for (var i = 0; i < pixels.length; i++) {
                    buffer.writeUInt8(pixels[i], offset); offset+=4;
                };
                image.data = buffer;
            }
        };
    }
};

module.exports = UTILS;