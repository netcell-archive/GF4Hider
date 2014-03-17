'use strict';

var should        = require('should'),
    root          = require('find-root')(),
    embed         = require(root+'/lib/controllers/lib/embed'),
    decode         = require(root+'/lib/controllers/lib/decode'),
    request       = require('supertest'),
    fs            = require('fs'),
    streamBuffers = require('stream-buffers');

describe('embed', function() {
    
    it('F2', function(done) {
        var pe = require('pretty-error').start(function(){

            var algorithm = 'F2',
                writer    = fs.createWriteStream('out.png'),
                base64w   = new streamBuffers.WritableStreamBuffer(),
                cover1    = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAjCAMAAADlnnmAAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo3MEI0NTg1QkExODAxMUUzQTM2N0RDMjU3RDYwRDMwNSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo3MEI0NTg1Q0ExODAxMUUzQTM2N0RDMjU3RDYwRDMwNSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjcwQjQ1ODU5QTE4MDExRTNBMzY3REMyNTdENjBEMzA1IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjcwQjQ1ODVBQTE4MDExRTNBMzY3REMyNTdENjBEMzA1Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+TsCXXwAAAX1QTFRF/Pz+UGqpP1ugGDqNzdPmZXuyjp7FAB995enxNFKbFziMOlieYnqyL06YJ0eTHD2PJkaUHj+RX3WvL0yZQl+iQF2hHT6PKEiVIEGR/Pz9PFmeP1ygO1idPlufJUaUPVqfcIW4Gz2OPFmfN1WcOVadOled+/z9PVmfJESTOFaccIS4HkCQrLfWc4i6NlSbHj+PZ32zPlqfFDeLsLrYM1GbOFadOVedKUmWNlScM1Ga+Pn7tb/bi5zFI0SSS2amz9XoK0qWN1Sc5ObyGzyPdIe6MlGaIUKRIkORyM/k2t/smKXMo7HQ/f3+VGyrydLlzdXniprFoa7Pcoe5gJPAg5TCPFie/v7+ASWCPVmewcviw8zixs3jW3CsucLbRmCjSGSjf5HATWemNlObME2ZT2mpa4G2JEWUP1yf09jor7vWQV6hUWuqvsjfKkmWMlCZDjCHNlWcETWJT2mnFTeMhJTChJfCbIG2b4K3GjyO4+XxMlCakKDHOlee////O1ie5xhExAAAAWpJREFUeNpiqCERMJCsoY4oICUlBWURoyGCSUpFRVVJnjgN3Ew1tsxufAIaYhryUkRoqJF2LYyvts7JsY4t5TUjQoO0CVd1LQT45yoT1iBVYBQIVV8bKa5JWIO8sxBMfW2UOREaVPUz4Rr8iNCgxCvDAVJrxcaTqiuUpEpQg6xAkRpIQzW7mH6FgGEoYQ0ajD4gDawVWUrqSoQjTiqdL5sBpEFLTBqWNvBoUFLmNNW2kwRpKDMyS+I0VSKgQZ5TuIo5DuwHg3zL5GQVeagGGbgSGWT1yu5elSweGWEgDZ7R9ixOwRLyeDXo8RvXooCECkO8Giz4dVA1sEqok6TBKlFAiiQncSg74M8PKrwGNiEubOCI8y4vCdDNc8QfrFKifMVi4SbgYI1hF+QSVJcnEA818kxZ5r7giAvSFmGS5SYiT8vKMYI1KChK1xFVaoxqGCQa0lLAGrQqEBrw1h7yUjxgDQmWsjAhgAADAFbc1/rO0w24AAAAAElFTkSuQmCC";

            writer.on('finish', function(){
                done();
            });

            base64w.on('close', function(){
                var newImage = "data:image/png;base64," + base64w.getContents().toString('base64');
                coverImageParse(newImage, function(image){
                    var result = decode(image, algorithm);
                    console.log(result)
                    console.log("data:application/zip;base64,"+result.toString('base64'));
                    done();
                });
            });
            
            coverImageParse(cover1, function(image){
                embedInfoParse("this is good", 'test.txt', function(info){
                    embed(image, info, algorithm).pipe(base64w);
                });
            });
        });
        pe.skipNodeFiles();
        pe.skipPackage('pngjs');
    //   request(app)
    //     .get('/api/awesomeThings')
    //     .expect(200)
    //     .expect('Content-Type', /json/)
    //     .end(function(err, res) {
    //       if (err) return done(err);
    //       res.body.should.be.instanceof(Array);
    //       done();
    //     });
    });
});