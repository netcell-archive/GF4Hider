var Algorithms = require('../../lib/Algorithms'),
    coverImageParse = require('../../lib/coverImageParse'),
    _ = require('lodash');

module.exports = function(req, res){
    var body         = req.body,
        algorithm    = body.algorithm,
        cover        = body.cover;
        
    if (!_.isString(cover)     ||
        !_.isString(algorithm)) return res.send(400);

    algorithm = Algorithms(algorithm);

    coverImageParse(cover, function(image){
        var numberOfPixels = image.data.length >>> 2;
        if (image.palette.length === 0) {
            numberOfPixels = numberOfPixels * 3;
        }

        var blockLength     = algorithm.blockLength,
            infoBlockLength = algorithm.infoBlockLength,

            numberOfBlocks = Math.floor(numberOfPixels/blockLength),
            max_infoLength_inBits  = numberOfBlocks * infoBlockLength,
            max_infoLength_inBytes = max_infoLength_inBits >>> 3,

            numberOfBlocks_max_infoLength_inBytes = Math.ceil(max_infoLength_inBytes.toString(2).length/infoBlockLength),

            binaryLength_max_infoLength_inBytes = numberOfBlocks_max_infoLength_inBytes * infoBlockLength,
            availableSpace_ForEmbedding         = max_infoLength_inBytes - binaryLength_max_infoLength_inBytes - 4;

        res.send(200, {
            availableSpace_ForEmbedding: availableSpace_ForEmbedding
        });
    }, function(err){
        res.send(400, {
            message: 'WRONG_FILE_TYPE'
        })
    });
};