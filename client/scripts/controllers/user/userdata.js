'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('betting')
  .controller('UserDataCtrl', function ($rootScope, $scope, $position, UserInfo_service, $interval, $http, Server_api_url) {

    UserInfo_service.checkUrl();

    $('#heading').text("User Data Dashboard");
    UserInfo_service.setHeading("User Data Dashboard");

    $scope.user_info = UserInfo_service.getUser();
    $scope.user_info.user_birthday = $scope.user_info.user_birthday == undefined ? '' : $scope.user_info.user_birthday.slice(0, 10);
    $scope.user_info.user_password = "";

    $scope.onUpdate = function () {
      if ($scope.user_info.user_password != $scope.user_info.user_retypepassword || $scope.user_info.user_password.length < 6) {
        alert("Retype Password !!");
        return;
      }

      var data = $.param({
        _id: $scope.user_info._id,
        user_id: $scope.user_info.user_id,
        user_email: $scope.user_info.user_email,
        user_password: $scope.user_info.user_password,
        user_firstname: $scope.user_info.user_firstname,
        user_lastname: $scope.user_info.user_lastname,
        user_birthday: $scope.user_info.user_birthday,
        user_address: $scope.user_info.user_address,
        user_city: $scope.user_info.user_city,
        user_phonenumber: $scope.user_info.user_phonenumber,
      });

      $http.post(Server_api_url + 'user/user_edit', data, UserInfo_service.http_config)
        .success(function (data, status, headers, config) {
          if (data.result == 1) {
            UserInfo_service.setUser($scope.user_info);
          }
        });
    }

    $scope.onCancel = function () {
      $scope.user_info = UserInfo_service.getUser();
      $scope.user_info.user_birthday = $scope.user_info.user_birthday.slice(0, 10);
      $scope.user_info.user_password = "";
      $scope.user_info.user_retypepassword = "";
    }

  });
