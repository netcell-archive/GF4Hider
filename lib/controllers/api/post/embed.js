var session = require('../../lib/session'),
    colorTools = require('../../lib/colorTools'),
    embed   = require('../../lib/embed'),
    embedInfoParse = require('../../lib/embedInfoParse'),
    coverImageParse = require('../../lib/coverImageParse'),
    _ = require('lodash'),
    streamBuffers = require('stream-buffers');

module.exports = function(req, res){
    var body         = req.body,
        algorithm    = body.algorithm,
        cover        = body.cover,
        cover_name   = body.cover_name,
        info         = body.info,
        info_name    = body.info_name,
        password     = body.password || false,
        stream;

    if (!password.length) password = false;
        
    if (!_.isString(info_name) || 
        !_.isString(info)      || 
        !_.isString(cover)     ||
        !_.isString(cover_name)||
        !_.isString(algorithm)) return res.send(400);

    var base64writer = new streamBuffers.WritableStreamBuffer();
        base64writer.on('close', function(){

            var result = base64writer.getContents().toString('base64');//,
                //url    = 'data:image/png;base64,' + result;

            if (stream && stream.destroy) stream.destroy();

            //console.log('Result extracted');

            // coverImageParse(cover, function(image1){
            //     coverImageParse(url, function(image2){
                    
            //         var psnr = colorTools.PSNR(image1.data, image2.data);
            //         //console.log('PSNR calculated');

            //         if (psnr !== null)
                        res.send( 200, {
                            data: result,
                            paletted: 1,//image1.palette.length,
                            psnr: 0
                        });
            //         else res.send(400, {
            //             message: 'IMAGES_DIMENSIONS_NO_MATCHED'
            //         });
            //     });
            // });
        });

    coverImageParse(cover, function(image){
        //console.log('Cover image parsed');
        embedInfoParse(info, info_name, function(info){
            //console.log('Embedding info parsed')
            embed(image, info, algorithm, function(fail_inf){
                res.send(400, fail_inf);
            }, password, function(stream){
                if (stream){
                    stream.on('error', function(){
                        if (base64writer && base64writer.destroy) base64writer.destroy();
                    });
                    stream.pipe(base64writer);
                } else {
                    if (base64writer && base64writer.destroy) base64writer.destroy();
                }
            });
        });
    }, function(err){
        res.send(400, {
            message: 'WRONG_FILE_TYPE'
        })
    });
}