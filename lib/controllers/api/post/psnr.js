var session = require('../../lib/session'),
    colorTools = require('../../lib/colorTools'),
    embed   = require('../../lib/embed'),
    embedInfoParse = require('../../lib/embedInfoParse'),
    coverImageParse = require('../../lib/coverImageParse'),
    _ = require('lodash'),
    streamBuffers = require('stream-buffers');

module.exports = function(req, res){
    var id           = session.create(),
        body         = req.body,
        algorithm    = body.algorithm,
        image1        = body.image1,
        image1_name   = body.image1_name,
        image2         = body.image2,
        image2_name    = body.image2_name;
        
    if (!_.isString(image2_name) || 
        !_.isString(image2)      || 
        !_.isString(image1)      ||
        !_.isString(image1_name) ||
        !_.isString(algorithm)) return res.send(400);

    coverImageParse(image1, function(image1){
        coverImageParse(image2, function(image2){
            var psnr = colorTools.PSNR(image1.data, image2.data);
            if (psnr) res.send(200, psnr);
            else res.send(400, {
                message: 'IMAGES_DIMENSIONS_NOT_MATCHED'
            });
        });
    });
}