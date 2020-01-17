'use strict';

/**
 * @ngdoc directive
 * @name izzyposWebApp.directive:adminPosHeader
 * @description
 * # adminPosHeader
 */

angular.module('betting')
  .directive('sidebar', ['$location', function () {
    return {
      templateUrl: 'scripts/directives/sidebar/sidebar.html',
      restrict: 'E',
      replace: true,
      scope: {
      },
      controller: function ($scope, $rootScope, $location, UserInfo_service) {
        $scope.selectedMenu = 'user';
        $scope.collapseVar = 0;
        $scope.multiCollapseVar = 0;

        $scope.selectedMenu = UserInfo_service.getUserRole();

        var width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
        var topOffset;
        if (width < 768) {
          $('div.navbar-collapse').addClass('collapse');
          topOffset = 100; // 2-row-menu
        } else {
          $('div.navbar-collapse').removeClass('collapse');
        }

        if ($scope.selectedMenu == null)
          $location.path('\\login');

        $scope.check = function (x) {
          if (x == 0) {
            $('.sidebar-nav').removeClass('in');

            // setTimeout(function () {
            //   $('.sidebar').css('min-height', '0px');
            //   $('.sidebar').css('max-height', '480px');
            // }, 200);
            // $('.navbar-toggle').click();
          }
          else {

            if (x == $scope.collapseVar)
              $scope.collapseVar = 0;
            else
              $scope.collapseVar = x;
          }
        };

        $scope.multiCheck = function (y) {

          if (y == $scope.multiCollapseVar)
            $scope.multiCollapseVar = 0;
          else
            $scope.multiCollapseVar = y;
        };
      }
    }
  }]);
