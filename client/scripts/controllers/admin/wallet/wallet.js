'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('betting')
  .controller('WalletCtrl', function ($rootScope, $scope, $position, UserInfo_service, $interval, Server_api_url, $http) {

    UserInfo_service.checkUrl();

    $('#heading').text("Admin Wallet Dashboard");
    UserInfo_service.setHeading("Admin Wallet Dashboard");

    var data = $.param({ user_role: 'user' });

    $http.post(Server_api_url + 'user/user_all', data, UserInfo_service.http_config)
      .success(function (data, status, headers, config) {

        $scope.users = data.users;

        setTimeout(function () {
          $('#userWalletTable').dataTable({
            "bPaginate": true,
            "bLengthChange": false,
            "bFilter": true,
            "bSort": true,
            "bInfo": true,
            "bAutoWidth": true,
            "sScrollX": "99%",
          });
        })
      })
      .success(function (data, status, headers, config) {
      });


  });
