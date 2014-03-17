'use strict';

angular.module('se10th20132App', [
  'ngRoute'
])
  .config(function ($routeProvider, $locationProvider, $compileProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'partials/main',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel|data):/);
    $locationProvider.html5Mode(true);
  });