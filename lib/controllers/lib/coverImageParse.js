var dataurl = require('dataurl'),
    streamBuffers = require('stream-buffers'),
    PNG = require('pngjs').PNG;

module.exports = function(input, callback, fail){

	var buffer = dataurl.parse(input).data;

	var coverImageStreamBuffer = new streamBuffers.ReadableStreamBuffer();
    var failed = false;

	coverImageStreamBuffer
    .pipe(new PNG({
        filterType: 4
    }))
    .on('parsed', function() {
        if (!failed) {
            callback(this);
        }
    }).on('error', function(err){
        failed = true;
        fail(err);
    });

    coverImageStreamBuffer.put(buffer);
}