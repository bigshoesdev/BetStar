'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('betting')
  .controller('UsersCtrl', function ($rootScope, $scope, $position, UserInfo_service, $interval) {

    UserInfo_service.checkUrl();

    $('#heading').text("Admin Users Dashboard");
    UserInfo_service.setHeading("Admin Users Dashboard");
    
    $('#usersTable').dataTable({
      'sScrollX': '99%',

    });
  });
