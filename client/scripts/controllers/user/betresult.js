'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('betting')
  .controller('BetResultCtrl', function ($rootScope, $scope, $position, UserInfo_service, $interval, $http, Server_api_url) {

    UserInfo_service.checkUrl();

    $('#heading').text("User Bet Result Dashboard");
    UserInfo_service.setHeading("User Bet Result Dashboard");

    var data = $.param({ status: true, checked: true });
    $http.post(Server_api_url + 'game/game_all', data, UserInfo_service.http_config)
      .success(function (data, status, headers, config) {
        var week_games = [];
        for (var i = 0; i < data.requests.length; i++) {
          function sameWeek(element) {
            return element.week_no == data.requests[i].week_no;
          }
          var index = week_games.findIndex(sameWeek);
          if (index == -1) {
            week_games.push({ week_no: data.requests[i].week_no, list: [] });
            index = week_games.length - 1;
          }
          week_games[index].list.push(data.requests[i].game_no);
        }
        for (var i = 0; i < week_games.length; i ++) {
          week_games[i].list.sort();
          week_games[i].games = week_games[i].list.toString();
        }
        $scope.week_games = week_games;
      });

  });
