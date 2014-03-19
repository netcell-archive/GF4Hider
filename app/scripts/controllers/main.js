'use strict';

function maxhide(width, height, blockLength, infoBlockLength){
	var numberOfPixels = width * height,
		numberOfBlocks = Math.floor(numberOfPixels/blockLength),

		max_infoLength_inBits  = numberOfBlocks * infoBlockLength,
		max_infoLength_inBytes = Math.floor(max_infoLength_inBits/8),

		numberOfBlocks_max_infoLength_inBytes = Math.ceil(max_infoLength_inBytes.toString(2).length/infoBlockLength),

		binaryLength_max_infoLength_inBytes = numberOfBlocks_max_infoLength_inBytes * infoBlockLength;
	
	return max_infoLength_inBytes - binaryLength_max_infoLength_inBytes;
}

function validImage(fileName) {
    var exp = /^.*\.(jpg|jpeg|gif|JPG|png|PNG)$/;         
    return exp.test(fileName);  
}

function validPng(fileName) {
    var exp = /^.*\.(png|PNG)$/;         
    return exp.test(fileName);  
}

angular.module('se10th20132App')
  .controller('MainCtrl', function ($scope, $http) {

    $scope.algorithms = [{
        name: 'GF4 Module',
        key:  'F2'
    }, {
        name: 'GF4 Weak Module',
        key: 'F2Weak'
    }];

    $scope.selections = {};

    $scope.selections.embed_algorithm = 0;
    $scope.selections.decode_algorithm = 0;

  	$scope.notpaletted = true;
    $scope.$watch('cover', function(file){
        if (validPng(file.name)) {
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
                    $scope.cover_max_info_size = maxhide(imwidth, imheight, 5, 4);
                    if (!validPng($scope.cover_name)) {
                        var canvas = document.createElement('canvas');
                        canvas.width = imwidth;
                        canvas.height = imheight;
                        var context = canvas.getContext('2d');
                        context.drawImage(img, 0, 0, imwidth, imheight);
                        $scope.coverDataURL = canvas.toDataURL();
                    }
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
			    		task.link = data.data.data;
			    		task.psnr = data.data.psnr;
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
        if (validPng(file.name)){
        	var reader = new FileReader();
            reader.onload = function (loadEvent) {
                $scope.containerDataURL = loadEvent.target.result;
                var img = new Image;
                img.onload = function(){
                	$scope.container_width = img.width;
                	$scope.container_height = img.height;
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
