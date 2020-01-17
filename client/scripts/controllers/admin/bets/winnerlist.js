'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('betting')
  .controller('WinnerListCtrl', function ($rootScope, $scope, $position, UserInfo_service, $interval, $http, Server_api_url) {

    UserInfo_service.checkUrl();

    $('#heading').text("Admin Winner List Dashboard");
    UserInfo_service.setHeading("Admin Winner List Dashboard");

    $rootScope.filter_betstatus = 'Active';

    var data = $.param({});

    $http.post(Server_api_url + 'bet/summary_total', data, UserInfo_service.http_config)
      .success(function (data, status, headers, config) {
        $rootScope.totalsummary = data.total_summary;
      });


    var data = $.param({ win_result: "Win" });

    $http.post(Server_api_url + 'bet/bet_all', data, UserInfo_service.http_config)
      .success(function (data, status, headers, config) {
        for (var i = 0; i < data.requests.length; i++) {
          var gamelist = [];
          if (data.requests[i].type == 'Group') {
            for (var j = 0; j < data.requests[i].gamelist.length; j++)
              gamelist.push(data.requests[i].gamelist[j].under + '(' + data.requests[i].gamelist[j].list.toLocaleString() + ')');
          }
          else
            gamelist = data.requests[i].gamelist;
          data.requests[i].gamelist = gamelist.toLocaleString();
          var scorelist = [];
          if (data.requests[i].type == 'Group') {
            for (var j = 0; j < data.requests[i].scorelist.length; j++)
              scorelist.push(data.requests[i].scorelist[j].under + '(' + data.requests[i].scorelist[j].list.toLocaleString() + ')');
          }
          else
            scorelist = data.requests[i].scorelist;
          data.requests[i].scorelist = scorelist.toLocaleString();
        }
        $rootScope.betsummary = data.requests;
      });

  });
