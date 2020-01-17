'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('betting')
  .controller('TestCtrl', function ($rootScope, $scope, $position, UserInfo_service, $interval, Server_api_url, $http) {

    UserInfo_service.checkUrl();

    $('#heading').text("admin test");
    UserInfo_service.setHeading("admin test");

    var data = $.param({});

    /*                total summary                   */

    $http.post(Server_api_url + 'bet/summary_total', data, UserInfo_service.http_config)
      .success(function (data, status, headers, config) {
        $rootScope.totalsummary = data.total_summary;
      });

    /*                staff summary                   */

    $http.post(Server_api_url + 'bet/summary_staff', data, UserInfo_service.http_config)
      .success(function (data, status, headers, config) {
        $rootScope.staffsummary = data.staff_summary;
      });

    /*                agent summary                   */
    $http.post(Server_api_url + 'bet/summary_agent', data, UserInfo_service.http_config)
      .success(function (data, status, headers, config) {
        $rootScope.agentsummary = data.agent_summary;
      });

    /*                terminal summary                   */

    $http.post(Server_api_url + 'bet/summary_terminal', data, UserInfo_service.http_config)
      .success(function (data, status, headers, config) {
        $rootScope.terminal_summary = data.terminal_summary;
      });

    /*                bet summary                   */

    $http.post(Server_api_url + 'bet/bet_all', data, UserInfo_service.http_config)
      .success(function (data, status, headers, config) {
        for (var i = 0; i < data.requests.length; i++) {
          var gamelist = [];
          if (data.requests[i].type == "Nap/Perm")
            gamelist = data.requests[i].gamelist;
          else {
            for (var j = 0; j < data.requests[i].gamelist.length; j++)
              gamelist.push(data.requests[i].gamelist[j].under + '(' + data.requests[i].gamelist[j].list.toLocaleString() + ')');
          }
          data.requests[i].gamelist = gamelist.toLocaleString();
          var scorelist = [];
          if (data.requests[i].type == "Nap/Perm")
            scorelist = data.requests[i].scorelist;
          else {
            for (var j = 0; j < data.requests[i].scorelist.length; j++)
              scorelist.push(data.requests[i].scorelist[j].under + '(' + data.requests[i].scorelist[j].list.toLocaleString() + ')');
          }
          data.requests[i].scorelist = scorelist.toLocaleString();
        }
        $rootScope.betsummary = data.requests;
      });


  });
