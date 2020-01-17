'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('betting')
  .controller('DashboardCtrl', function ($rootScope, $scope, $position, UserInfo_service, $interval, $http, Server_api_url) {

    UserInfo_service.checkUrl();

    $('body').removeClass('bg-black');

    $('#heading').text("User Dashboard");
    UserInfo_service.setHeading("User Dashboard");

    var data = $.param({});
    $http.post(Server_api_url + 'bet/details', data, UserInfo_service.http_config)
      .success(function (data, status, headers, config) {
        $scope.bet_cnt = data.bet_cnt;
        $scope.agent_cnt = data.agent_cnt;
        $scope.terminal_cnt = data.terminal_cnt;
      });

  });
