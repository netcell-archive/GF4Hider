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

angular.module('se10th20132App')
  .controller('MainCtrl', function ($scope, $http) {
  	$scope.notpaletted = true;
    $scope.$watch('cover', function(file){
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
            	$scope.$apply();

			 	var context = $scope.cover_canvas.getContext('2d');
			 	context.clearRect(0,0,cvwidth,cvheight);
			 	context.drawImage(img, 0, (cvheight - scheight) / 2, scwidth, scheight);
			};
			$scope.cover_src = $scope.coverDataURL;
			img.src = $scope.coverDataURL;
        }
        if (file) {
        	$scope.cover_name = file.name;
        	reader.readAsDataURL(file);
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

    $scope.$watch('coverDataURL', embed);
    $scope.$watch('infoDataURL', embed);

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
    function embed(){
    	if ($scope.infoDataURL && $scope.coverDataURL) {
    		var task = {
    			width: $scope.cover_width,
    			height: $scope.cover_height,
    			size: $scope.info_size
    		}
    		$scope.embed_tasks.push(task);
    		if (!$scope.notpaletted) {
	    		if (task.size < $scope.cover_max_info_size) {
		    		$http.post('/api/embed', {
		    			algorithm: 'F2',
		    			cover: $scope.coverDataURL,
		    			cover_name: $scope.cover_name,
		    			info: $scope.infoDataURL,
		    			info_name: $scope.info_name
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
    	var reader = new FileReader();
        reader.onload = function (loadEvent) {
            $scope.containerDataURL = loadEvent.target.result;
            var img = new Image;
            img.onload = function(){
            	$scope.container_width = img.width;
            	$scope.container_height = img.height;
            	$scope.$apply();
			};
			$scope.container_src = $scope.containerDataURL;
			img.src = $scope.containerDataURL;
        }
        if (file) {
        	$scope.container_name = file.name;
        	reader.readAsDataURL(file);
        }
    });

    $scope.$watch('containerDataURL', decode);
    $scope.decode_tasks = [];
    function decode(){
    	if ($scope.containerDataURL) {
    		var task = {
    			width: $scope.container_width,
    			height: $scope.container_height,
    			size: $scope.container_size
    		}
    		$scope.decode_tasks.push(task);
    		$http.post('/api/decode', {
    			algorithm: 'F2',
    			container: $scope.containerDataURL,
    			container_name: $scope.container_name,
	    	}).then(function(data){
	    		task.link = data.data.data;
	    		task.size = data.data.size;
	    	}, function(data){
	    		switch(data.data.message){
	    			case 'WRONG_FILE':
	    			case 'WRONG_FILE_TYPE':
	    			case 'NOT_PALETTED':
	    				task.fail = 'Wrong file!';
	    				break;
	    			default:
	    				task.fail = 'Unknown error!';
	    				break;
	    		}
	    	});
    	}
    }
  });
