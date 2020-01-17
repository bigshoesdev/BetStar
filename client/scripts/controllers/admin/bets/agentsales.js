'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('betting')
  .controller('AgentSaleCtrl', function ($rootScope, $scope, $position, UserInfo_service, $interval, $http, Server_api_url) {

    UserInfo_service.checkUrl();

    $('#heading').text("Admin Agent Sales Dashboard");
    UserInfo_service.setHeading("Admin Agent Sales Dashboard");

    var data = $.param({});

    $http.post(Server_api_url + 'bet/summary_total', data, UserInfo_service.http_config)
      .success(function (data, status, headers, config) {
        $rootScope.totalsummary = data.total_summary;
      });

    $http.post(Server_api_url + 'bet/summary_agent', data, UserInfo_service.http_config)
      .success(function (data, status, headers, config) {
        $rootScope.agentsummary = data.agent_summary;
      });

  });
