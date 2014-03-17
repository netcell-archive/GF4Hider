'use strict';

angular.module('se10th20132App')
  .directive('image', function () {
    return {
        scope: {
            image: '='
        },
        restrict: "A",
        link: function(scope, el, attrs){
        	scope.image = el[0];
            scope.$apply();
        }
    };
  });
