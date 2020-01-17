'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('betting')
  .controller('TerminalSalesCtrl', function ($rootScope, $scope, $position, UserInfo_service, $interval, Server_api_url, $http) {

    UserInfo_service.checkUrl();

    $('#heading').text("Agent Terminal Sales");
    UserInfo_service.setHeading("Agent Terminal Sales");

    var data = $.param({ agent_id: UserInfo_service.getUser().user_id });

    $http.post(Server_api_url + 'bet/summary_total', data, UserInfo_service.http_config)
      .success(function (data, status, headers, config) {
        $rootScope.totalsummary = data.total_summary;
      });

    data = $.param({ agent_id: UserInfo_service.getUser().user_id });
    $http.post(Server_api_url + 'bet/summary_terminal', data, UserInfo_service.http_config)
      .success(function (data, status, headers, config) {
        $rootScope.terminal_summary = data.terminal_summary;
      });
  });
