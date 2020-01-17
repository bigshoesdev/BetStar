'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('betting')
  .controller('RequestCtrl', function ($rootScope, $scope, $position, UserInfo_service, $interval, $http, Server_api_url) {

    UserInfo_service.checkUrl();

    $('#heading').text("Admin Deposit Request Dashboard");
    UserInfo_service.setHeading("Admin Deposit Request Dashboard");

    var data = $.param({});
    var oTable;
    $http.post(Server_api_url + 'wallet/request_all', data, UserInfo_service.http_config)
      .success(function (data, status, headers, config) {

        if (data.result == 1) {
          $scope.requests = data.requests;
        }

        setTimeout(function () {
          oTable = $('#userWalletTable').dataTable({
            "bPaginate": true,
            "bLengthChange": false,
            "bFilter": true,
            "bSort": true,
            "bInfo": true,
            "bAutoWidth": true,
            "sScrollX": "99%",
          });
        });
      });

    $scope.onApproved = function (index) {
      var data = $.param({ _id: $scope.requests[index]._id });
      $http.post(Server_api_url + 'wallet/request_approve', data, UserInfo_service.http_config)
        .success(function (data, status, headers, config) {
          if (data.result == 1) {
            $('#status_' + index)[0].innerText = 'Approved';
            $('#aprv_' + index).addClass('Approved');
            $('#dsms_' + index).addClass('Approved');

            var req_index = $rootScope.deposit_requests.findIndex(function (elem) {
              return elem._id == $scope.requests[index]._id;
            });

            if (req_index != -1)
              $rootScope.deposit_requests.splice(req_index, 1);
            // $scope.requests[index] = data.request;
          }
          else {
            alert(data.message);
          }
        })
        .error(function (data, status, headers, config) {
        });
    }
    $scope.onDismiss = function (index) {
      var data = $.param({ _id: $scope.requests[index]._id });
      $http.post(Server_api_url + 'wallet/request_dismiss', data, UserInfo_service.http_config)
        .success(function (data, status, headers, config) {
          if (data.result == 1) {
            $('#status_' + index)[0].innerText = 'Dismiss';
            $('#aprv_' + index).addClass('Dismiss');
            $('#dsms_' + index).addClass('Dismiss');

            var req_index = $rootScope.deposit_requests.findIndex(function (elem) {
              return elem._id == $scope.requests[index]._id;
            });

            if (req_index != -1)
              $rootScope.deposit_requests.splice(req_index, 1);
            // $scope.requests[index] = data.request;
          }
          else {
            alert(data.message);
          }
        })
        .error(function (data, status, headers, config) {
        });
    }
    $scope.onDelete = function (id) {
      var data = $.param({ _id: id });
      $http.post(Server_api_url + 'wallet/request_delete', data, UserInfo_service.http_config)
        .success(function (data, status, headers, config) {
          if (data.result == 1) {
            oTable.fnDeleteRow($('[data-id=' + id + ']')[0]);

            var req_index = $rootScope.deposit_requests.findIndex(function (elem) {
              return elem._id == id;
            });

            if (req_index != -1)
              $rootScope.deposit_requests.splice(req_index, 1);
          }
          else {
            alert(data.message);
          }
        })
        .error(function (data, status, headers, config) {
        });
    }
  });
