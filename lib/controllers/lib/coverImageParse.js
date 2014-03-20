var dataurl = require('dataurl'),
    streamBuffers = require('stream-buffers'),
    PNG = require('./pngjs/png.js').PNG;

module.exports = function(input, callback, fail){

	var buffer = dataurl.parse(input).data;

	var coverImageStreamBuffer = new streamBuffers.ReadableStreamBuffer();

	coverImageStreamBuffer
    .pipe(new PNG({
        filterType: 4
    }))
    .on('parsed', function() {
        callback(this);
    }).on('error', function(err){
        fail(err);
    });

    coverImageStreamBuffer.put(buffer);
}