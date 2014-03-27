'use strict';

angular.module('se10th20132App')
.directive('file', function(){
    return {
        scope: {
            file: '='
        },
        link: function(scope, el, attrs){
            var hiddenFileInput = document.createElement("input");
            hiddenFileInput.setAttribute("type", "file");
            hiddenFileInput.setAttribute("type", "file");
            hiddenFileInput.style.visibility = "hidden";
            hiddenFileInput.style.position = "absolute";
            hiddenFileInput.style.top = "0";
            hiddenFileInput.style.left = "0";
            hiddenFileInput.style.height = "0";
            hiddenFileInput.style.width = "0";
            document.body.appendChild(hiddenFileInput);
            hiddenFileInput.addEventListener("change", function(e) {
                var files = hiddenFileInput.files;
                var file  = [];
                for (var i = 0; i < files.length; i++) {
                    file.push(files[i]);
                };
                scope.file = file;
                scope.$apply();
            });
            el.on('click', function(){
                hiddenFileInput.click();
            })
            el.on('dragenter', function (e) 
            {
                e.stopPropagation();
                e.preventDefault();
                el.addClass('hover');
            });
            el.on('dragleave', function (e) 
            {
                e.stopPropagation();
                e.preventDefault();
                el.removeClass('hover');
            });
            el.on('dragover', function (e) 
            {
                e.stopPropagation();
                e.preventDefault();
                el.addClass('hover');
            });
            el.on('drop', function (e) 
            {
                el.removeClass('hover');
                e.preventDefault();
                var files = e.originalEvent.dataTransfer.files;
                var file  = [];
                for (var i = 0; i < files.length; i++) {
                    file.push(files[i]);
                };
                scope.file = file;
                scope.$apply();
            });
            $(document).on('dragenter', function (e) 
            {
                e.stopPropagation();
                e.preventDefault();
            });
            $(document).on('dragover', function (e) 
            {
              e.stopPropagation();
              e.preventDefault();
            });
            $(document).on('drop', function (e) 
            {
                e.stopPropagation();
                e.preventDefault();
            });
        }
    };
});