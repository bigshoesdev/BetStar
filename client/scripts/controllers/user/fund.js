'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('betting')
  .controller('FundCtrl', function ($rootScope, $scope, $position, UserInfo_service, $interval, $http, Server_api_url) {

    UserInfo_service.checkUrl();
    $scope.fundModel = {
      request_accountno: '',
      request_bankname: '',
      request_accountowner: '',
      request_type: 'Deposit',
      amount: 1000,
    }

    $('#heading').text("User Fund Dashboard");
    UserInfo_service.setHeading("User Fund Dashboard");

    $scope.onFund = function () {
      var requester = UserInfo_service.getUserId();

      if ($scope.fundModel.request_accountno == '') {
        alert("Input Account No");
        return;
      }

      if ($scope.fundModel.request_bankname == '') {
        alert("Input Bank Name");
        return;
      }

      if ($scope.fundModel.amount == '') {
        alert("Input Amount");
        return;
      }

      var data = $.param({
        requester: requester,
        request_accountno: $scope.fundModel.request_accountno,
        request_bankname: $scope.fundModel.request_bankname,
        request_type: $scope.fundModel.request_type,
        request_amount: $scope.fundModel.amount
      });
      $http.post(Server_api_url + 'wallet/request_add', data, UserInfo_service.http_config)
        .success(function (data, status, headers, config) {
          if (data.result == 1) {
            alert("Success");
          }
          else {
            alert(data.message);
          }
        });
    }
  });
