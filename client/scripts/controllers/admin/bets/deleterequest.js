'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('betting')
  .controller('DeleteRequestCtrl', function ($rootScope, $scope, $position, UserInfo_service, $interval, $http, Server_api_url) {

    UserInfo_service.checkUrl();

    $('#heading').text("Admin Delete Bet Requests");
    UserInfo_service.setHeading("Admin Delete Bet Requests");

    var data = $.param({ status: "Waiting" });

    $http.post(Server_api_url + 'bet/voidrequests', data, UserInfo_service.http_config)
      .success(function (data, status, headers, config) {
        for (var i = 0; i < data.bets.length; i++) {
          var gamelist = [];
          if (data.bets[i].type == "Group") {
            for (var j = 0; j < data.bets[i].gamelist.length; j++)
              gamelist.push(data.bets[i].gamelist[j].under + '(' + data.bets[i].gamelist[j].list.toLocaleString() + ')');
          }
          else {
            gamelist = data.bets[i].gamelist;
          }
          data.bets[i].gamelist = gamelist.toLocaleString();
          var scorelist = [];
          if (data.bets[i].type == "Group") {
            for (var j = 0; j < data.bets[i].scorelist.length; j++)
              scorelist.push(data.bets[i].scorelist[j].under + '(' + data.bets[i].scorelist[j].list.toLocaleString() + ')');
          }
          else {
            scorelist = data.bets[i].gamelist;
          }
          data.bets[i].scorelist = scorelist.toLocaleString();
        }
        $rootScope.betsummary = data.bets;
        $rootScope.requests = data.requests;        
      });



  });
