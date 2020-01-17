'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('betting')
  .controller('StaffSaleCtrl', function ($rootScope, $scope, $position, UserInfo_service, $interval, $http, Server_api_url) {

    UserInfo_service.checkUrl();

    $('#heading').text("Admin Staff Sales Dashboard");
    UserInfo_service.setHeading("Admin Staff Sales Dashboard");

    var data = $.param({});

    $http.post(Server_api_url + 'bet/summary_total', data, UserInfo_service.http_config)
      .success(function (data, status, headers, config) {
        $rootScope.totalsummary = data.total_summary;
      });

    $http.post(Server_api_url + 'bet/summary_staff', data, UserInfo_service.http_config)
      .success(function (data, status, headers, config) {
        $rootScope.staffsummary = data.staff_summary;
      });

  });
