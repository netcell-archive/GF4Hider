'use strict';

// ok, we're good
var readCanvasData = function(oCanvas) {
    var iWidth = parseInt(oCanvas.width);
    var iHeight = parseInt(oCanvas.height);
    return oCanvas.getContext("2d").getImageData(0,0,iWidth,iHeight);
}

// base64 encodes either a string or an array of charcodes
var encodeData = function(data) {
    var strData = "";
    if (typeof data == "string") {
        strData = data;
    } else {
        var aData = data;
        for (var i=0;i<aData.length;i++) {
            strData += String.fromCharCode(aData[i]);
        }
    }
    return btoa(strData);
}

// creates a base64 encoded string containing BMP data
// takes an imagedata object as argument
var createBMP = function(oData) {
    var aHeader = [];

    var iWidth = oData.width;
    var iHeight = oData.height;

    aHeader.push(0x42); // magic 1
    aHeader.push(0x4D); 

    var iFileSize = iWidth*iHeight*3 + 54; // total header size = 54 bytes
    aHeader.push(iFileSize % 256); iFileSize = Math.floor(iFileSize / 256);
    aHeader.push(iFileSize % 256); iFileSize = Math.floor(iFileSize / 256);
    aHeader.push(iFileSize % 256); iFileSize = Math.floor(iFileSize / 256);
    aHeader.push(iFileSize % 256);

    aHeader.push(0); // reserved
    aHeader.push(0);
    aHeader.push(0); // reserved
    aHeader.push(0);

    aHeader.push(54); // dataoffset
    aHeader.push(0);
    aHeader.push(0);
    aHeader.push(0);

    var aInfoHeader = [];
    aInfoHeader.push(40); // info header size
    aInfoHeader.push(0);
    aInfoHeader.push(0);
    aInfoHeader.push(0);

    var iImageWidth = iWidth;
    aInfoHeader.push(iImageWidth % 256); iImageWidth = Math.floor(iImageWidth / 256);
    aInfoHeader.push(iImageWidth % 256); iImageWidth = Math.floor(iImageWidth / 256);
    aInfoHeader.push(iImageWidth % 256); iImageWidth = Math.floor(iImageWidth / 256);
    aInfoHeader.push(iImageWidth % 256);

    var iImageHeight = iHeight;
    aInfoHeader.push(iImageHeight % 256); iImageHeight = Math.floor(iImageHeight / 256);
    aInfoHeader.push(iImageHeight % 256); iImageHeight = Math.floor(iImageHeight / 256);
    aInfoHeader.push(iImageHeight % 256); iImageHeight = Math.floor(iImageHeight / 256);
    aInfoHeader.push(iImageHeight % 256);

    aInfoHeader.push(1); // num of planes
    aInfoHeader.push(0);

    aInfoHeader.push(24); // num of bits per pixel
    aInfoHeader.push(0);

    aInfoHeader.push(0); // compression = none
    aInfoHeader.push(0);
    aInfoHeader.push(0);
    aInfoHeader.push(0);

    var iDataSize = iWidth*iHeight*3; 
    aInfoHeader.push(iDataSize % 256); iDataSize = Math.floor(iDataSize / 256);
    aInfoHeader.push(iDataSize % 256); iDataSize = Math.floor(iDataSize / 256);
    aInfoHeader.push(iDataSize % 256); iDataSize = Math.floor(iDataSize / 256);
    aInfoHeader.push(iDataSize % 256); 

    for (var i=0;i<16;i++) {
        aInfoHeader.push(0);    // these bytes not used
    }

    var iPadding = (4 - ((iWidth * 3) % 4)) % 4;

    var aImgData = oData.data;

    var strPixelData = "";
    var y = iHeight;
    do {
        var iOffsetY = iWidth*(y-1)*4;
        var strPixelRow = "";
        for (var x=0;x<iWidth;x++) {
            var iOffsetX = 4*x;

            strPixelRow += String.fromCharCode(aImgData[iOffsetY+iOffsetX+2]);
            strPixelRow += String.fromCharCode(aImgData[iOffsetY+iOffsetX+1]);
            strPixelRow += String.fromCharCode(aImgData[iOffsetY+iOffsetX]);
        }
        for (var c=0;c<iPadding;c++) {
            strPixelRow += String.fromCharCode(0);
        }
        strPixelData += strPixelRow;
    } while (--y);

    var strEncoded = encodeData(aHeader.concat(aInfoHeader)) + encodeData(strPixelData);

    return strEncoded;
}

function buildBMP(oCanvas) {

    var oData = readCanvasData(oCanvas);
    var strImgData = createBMP(oData);
    return strImgData;
}

function maxhide(width, height, blockLength, infoBlockLength){
    var numberOfPixels = width * height,
        numberOfBlocks = Math.floor(numberOfPixels/blockLength),

        max_infoLength_inBits  = numberOfBlocks * infoBlockLength,
        max_infoLength_inBytes = Math.floor(max_infoLength_inBits/8),

        numberOfBlocks_max_infoLength_inBytes = Math.ceil(max_infoLength_inBytes.toString(2).length/infoBlockLength),

        binaryLength_max_infoLength_inBytes = numberOfBlocks_max_infoLength_inBytes * infoBlockLength;
    
    return max_infoLength_inBytes - binaryLength_max_infoLength_inBytes;
}

// function validImage(fileName) {
//     var exp = /^.*\.(jpg|jpeg|gif|JPG|png|PNG)$/;         
//     return exp.test(fileName);  
// }

function validImage(fileName) {
    var exp = /^.*\.(jpg|jpeg|gif|bmp|BMP|png|PNG)$/;
    return exp.test(fileName);  
}

function validPng(fileName) {
    var exp = /^.*\.(png|PNG)$/;         
    return exp.test(fileName);  
}

function b64toBlob(b64Data, contentType, sliceSize) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;

    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        var slice = byteCharacters.slice(offset, offset + sliceSize);

        var byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        var byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, {type: contentType});
    return blob;
}

angular.module('se10th20132App')
  .controller('MainCtrl', function ($scope, $http) {

    $scope.algorithms = [{
        name: 'GF4 Module',
        key:  'F2',
        blockLength: 5,
        infoBlockLength: 4
    }, {
        name: 'GF4 Weak Module',
        key: 'F2Weak',
        blockLength: 4,
        infoBlockLength: 4
    }];

    $scope.selections = {};

    $scope.selections.embed_algorithm = 0;
    $scope.selections.decode_algorithm = 0;
    $scope.updateCoverMaxInfoSize = function(){};

  	$scope.notpaletted = true;
    $scope.$watch('cover', function(file){
        if (validImage(file.name)) {
            $scope.notpaletted = false;
            var reader = new FileReader();
            reader.onload = function (loadEvent) {
                $scope.coverDataURL = loadEvent.target.result;
                var img = new Image;
                img.onload = function(){
                    var imwidth  = img.width,
                        imheight = img.height;

                    $scope.cover_width = imwidth;
                    $scope.cover_height = imheight;
                    $scope.cover_max_info_size_prefix = 'at least ';
                    if (!validPng($scope.cover_name)) {
                        var canvas = document.createElement('canvas');
                        canvas.width = imwidth;
                        canvas.height = imheight;
                        var context = canvas.getContext('2d');
                        context.drawImage(img, 0, 0, imwidth, imheight);
                        $scope.coverDataURL = canvas.toDataURL();
                    }
                    $scope.updateCoverMaxInfoSize = function(){
                        $scope.cover_max_info_size = maxhide(imwidth, imheight, $scope.algorithms[$scope.selections.embed_algorithm].blockLength, $scope.algorithms[$scope.selections.embed_algorithm].infoBlockLength);
                        $http.post('/api/maxInfoSize', {
                            algorithm: $scope.algorithms[$scope.selections.embed_algorithm].key,
                            cover: $scope.coverDataURL,
                        }).then(function(data){
                            $scope.cover_max_info_size_prefix = '';
                            $scope.cover_max_info_size = data.data.availableSpace_ForEmbedding;
                            $scope.$apply();
                        });
                    };
                    $scope.updateCoverMaxInfoSize();
                    $scope.$apply();
                };
                $scope.cover_src = $scope.coverDataURL;
                img.src = $scope.coverDataURL;
            }
            if (file) {
                $scope.cover_name = file.name;
                reader.readAsDataURL(file);
            }
        }
    });

    $scope.$watch('info', function(file){
    	if (!$scope.notpaletted){
	    	var reader = new FileReader();
	        reader.onload = function (loadEvent) {
	            $scope.infoDataURL = loadEvent.target.result;
	            $scope.$apply();
	        }
	        if (file) {
	        	$scope.info_name = file.name;
	        	$scope.info_size = file.size;
	        	reader.readAsDataURL(file);
	        }
    	}
    });

    // $scope.$watch('coverDataURL', embed);
    // $scope.$watch('infoDataURL', embed);

    $scope.embed_tasks = [];
    $scope.avg_psnr = 0;
    function avg_psnr_fn(){
    	var result = 0, count = 0;;
    	for (var i = 0; i < $scope.embed_tasks.length; i++) {
    		if ($scope.embed_tasks[i].psnr) {
    			result += $scope.embed_tasks[i].psnr;
    			count++;
    		}
    	};
    	$scope.avg_psnr = result/count;
    	$scope.$apply();
    };
    $scope.embed = function(){
    	if ($scope.infoDataURL && $scope.coverDataURL) {
    		var task = {
    			width: $scope.cover_width,
    			height: $scope.cover_height,
    			size: $scope.info_size,
                algorithm: $scope.algorithms[$scope.selections.embed_algorithm].name,
                org: $scope.coverDataURL
    		}
    		$scope.embed_tasks.push(task);
    		if (!$scope.notpaletted) {
	    		if (task.size < $scope.cover_max_info_size) {
		    		$http.post('/api/embed', {
		    			algorithm: $scope.algorithms[$scope.selections.embed_algorithm].key,
		    			cover: $scope.coverDataURL,
		    			cover_name: $scope.cover_name,
		    			info: $scope.infoDataURL,
		    			info_name: $scope.info_name,
                        password: $scope.s.cover_password
			    	}).then(function(data){
                        task.image_link = 'data:image/png;base64,' + data.data.data;
			    		task.link = URL.createObjectURL(b64toBlob(data.data.data, 'image/png'));
                        task.paletted = data.data.paletted;
                        var img = new Image;
                        img.onload = function(){
                            var canvas = document.createElement('canvas');
                            canvas.width = img.width;
                            canvas.height = img.height;
                            var context = canvas.getContext('2d');
                            context.drawImage(img, 0, 0, img.width, img.height);
                            task.bmpLink = URL.createObjectURL(b64toBlob(buildBMP(canvas), 'image/bmp'));
                            $scope.$apply();
                        }
                        task.psnr = data.data.psnr;
                        img.src = task.image_link;
			    		avg_psnr_fn();
			    	}, function(data){
			    		switch(data.data.message){
			    			case 'WRONG_FILE_TYPE':
			    			case 'NOT_PALETTED':
			    				task.fail = 'Image is not paletted png!';
			    				$scope.notpaletted = true;
			    				break;
			    			case 'INFO_TOO_LONG':
			    				task.fail = 'File is too big!';
			    				break;
			    			default:
			    				task.fail = 'Unknown error!';
			    				break;
			    		}
			    	});
			    } else task.fail = 'File too big!';
			} else task.fail = 'Image is not paletted png!';
    	}
    }
    $scope.$watch('container', function(file){
        if (validImage(file.name)){
        	var reader = new FileReader();
            reader.onload = function (loadEvent) {
                $scope.containerDataURL = loadEvent.target.result;
                var img = new Image;
                img.onload = function(){
                	$scope.container_width = img.width;
                	$scope.container_height = img.height;
                    if (!validPng($scope.container_name)) {
                        var canvas = document.createElement('canvas');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        var context = canvas.getContext('2d');
                        context.drawImage(img, 0, 0, img.width, img.height);
                        $scope.containerDataURL = canvas.toDataURL();
                    }
                    $scope.container_src = $scope.containerDataURL;
                	$scope.$apply();
    			};
                img.src = $scope.containerDataURL;
            }
            if (file) {
            	$scope.container_name = file.name;
            	reader.readAsDataURL(file);
            }
        }
    });

    //$scope.$watch('containerDataURL', decode);
    $scope.decode_tasks = [];
    $scope.decode = function(){
    	if ($scope.containerDataURL) {
    		var task = {
    			width: $scope.container_width,
    			height: $scope.container_height,
    			size: $scope.container_size,
                algorithm: $scope.algorithms[$scope.selections.decode_algorithm].name
    		}
    		$scope.decode_tasks.push(task);
            console.log($scope.s.decode_password)
    		$http.post('/api/decode', {
    			algorithm: $scope.algorithms[$scope.selections.decode_algorithm].key,
    			container: $scope.containerDataURL,
    			container_name: $scope.container_name,
                password: $scope.s.decode_password
	    	}).then(function(data){
	    		task.link = data.data.data;
	    		task.size = data.data.size;
	    	}, function(data){
	    		switch(data.data.message){
	    			case 'WRONG_FILE':
                        task.fail = 'Wrong file or password or algorithm!';
                        break;
	    			case 'WRONG_FILE_TYPE':
                        task.fail = 'Wrong file type!';
                        break;
	    			case 'NOT_PALETTED':
	    				task.fail = 'Image not paletted!';
	    				break;
	    			default:
	    				task.fail = 'Unknown error!';
	    				break;
	    		}
                if (data.data.error) console.log(data.data.error)
	    	});
    	}
    }
  });
