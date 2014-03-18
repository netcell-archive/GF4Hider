var session = require('../../lib/session'),
    decode   = require('../../lib/decode'),
    coverImageParse = require('../../lib/coverImageParse'),
    _ = require('lodash'),
    streamBuffers = require('stream-buffers');

module.exports = function(req, res){
    var id               = session.create(),
        body             = req.body,
        algorithm        = body.algorithm,
        container        = body.container,
        container_name   = body.container_name;

    console.log(container_name)
        
    if (!_.isString(container) ||
        !_.isString(container_name)||
        !_.isString(algorithm)) return res.send(400);

    coverImageParse(container, function(image){
        try {
            var result = decode(image, algorithm);
            if (result.length)
                res.send(200, {
                    data: 'data:application/zip;base64,' + result.toString('base64'),
                    size: result.length
                });
            else res.send(400, {
                message: 'WRONG_FILE'
            });
        } catch (e) {
            console.log(e);
            res.send(400, {
                message: 'WRONG_FILE',
                error: e
            });
        }
    }, function(err){
        console.log(err);
        res.send(400, {
            message: 'WRONG_FILE_TYPE',
            error: err
        })
    });
}