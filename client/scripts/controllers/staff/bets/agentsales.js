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

    $('#heading').text("Staff Agent Sales Dashboard");
    UserInfo_service.setHeading("Staff Agent Sales Dashboard");

    var data = $.param({ user_role: 'agent', user_staff: UserInfo_service.getUser().user_id });
    $http.post(Server_api_url + 'user/user_all', data, UserInfo_service.http_config)
      .success(function (agentdata, status, headers, config) {

        var filter = [];

        for (var i = 0; i < agentdata.users.length; i++) {
          filter.push({ agent_id: agentdata.users[i].user_id });
        }

        var data = $.param({ $or: filter });

        $http.post(Server_api_url + 'bet/summary_total', data, UserInfo_service.http_config)
          .success(function (data, status, headers, config) {
            $rootScope.totalsummary = data.total_summary;
          });
        $http.post(Server_api_url + 'bet/summary_agent', data, UserInfo_service.http_config)
          .success(function (data, status, headers, config) {
            $rootScope.agentsummary = data.agent_summary;
          });
      })



  });
