'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('betting')
  .controller('DashboardCtrl', function ($rootScope, $scope, $position, $route, $location, $templateCache, UserInfo_service, $interval, Server_api_url, $http) {

    UserInfo_service.checkUrl();
    $('body').removeClass('bg-black');
    $('#heading').text("Staff Dashboard");
    UserInfo_service.setHeading("Staff Dashboard");

    var data = $.param({ user_role: 'agent', user_staff: UserInfo_service.getUser().user_id });
    $http.post(Server_api_url + 'user/user_all', data, UserInfo_service.http_config)
      .success(function (agentdata, status, headers, config) {

        var filter = [];

        for (var i = 0; i < agentdata.users.length; i++) {
          filter.push({ agent_id: agentdata.users[i].user_id });
        }

        var data = $.param({ $or: filter });
        $http.post(Server_api_url + 'bet/details', data, UserInfo_service.http_config)
          .success(function (data, status, headers, config) {
            $scope.bet_cnt = data.bet_cnt;
            $scope.agent_cnt = data.agent_cnt;
            $scope.terminal_cnt = data.terminal_cnt;
            $scope.deleterequest_cnt = data.deleterequest_cnt;
            $scope.approved_cnt = data.approved_cnt;
            $scope.dismiss_cnt = data.dismiss_cnt;
          });

        $http.post(Server_api_url + 'bet/summary_total', data, UserInfo_service.http_config)
          .success(function (data, status, headers, config) {
            $scope.total_summary = data.total_summary;
          });
      })
  });
