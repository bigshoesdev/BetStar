'use strict';

/**
 * @ngdoc directive
 * @name izzyposWebApp.directive:adminPosHeader
 * @description
 * # adminPosHeader
 */
angular.module('betting')
  .directive('stats', function () {
    return {
      templateUrl: 'scripts/directives/stats/stats.html',
      restrict: 'E',
      replace: true,
      scope: {
        'model': '=',
        'comments': '@',
        'number': '@',
        'name': '@',
        'colour': '@',
        'size': '@',
        'details': '@',
        'type': '@',
        'goto': '@',
        'nextpath': '@',
      }

    }
  });
