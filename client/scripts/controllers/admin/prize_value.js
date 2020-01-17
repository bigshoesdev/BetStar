'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('betting')
  .controller('PrizeValueCtrl', function ($rootScope, $scope, $position, UserInfo_service, $interval, $http, Server_api_url) {

    UserInfo_service.checkUrl();

    $('#heading').text("Admin Prize Value Dashboard");
    UserInfo_service.setHeading("Admin Prize Value Dashboard");

    var data = $.param({});

    $http.post(Server_api_url + 'setting/option_all', data, UserInfo_service.http_config)
      .success(function (data, status, headers, config) {
        if (data.result == 1) {
          $scope.options = data.options;
        }

      })
      .error(function (data, status, headers, config) {
      })

    $scope.set_prizevalue = function () {
      for (var i = 0; i < $scope.options.length; i++) {
        if ($scope.options[i].prize == undefined)
          $scope.options[i].prize = [];
        for (var j = 0; j < 4; j++) {
          $scope.options[i].prize[j] = $("#prize_" + i + "_" + j).val();
        }
      }

      var data = $.param({ options: $scope.options });

      $http.post(Server_api_url + 'setting/set_prize', data, UserInfo_service.http_config)
        .success(function (data, status, headers, config) {
        })
        .error(function (data, status, headers, config) {
        })
    }

  });
