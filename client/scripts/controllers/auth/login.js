'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('betting')
  .controller('LoginCtrl', function ($http, $rootScope, $scope, $position, $state, UserInfo_service, Server_api_url) {

    if (UserInfo_service.checkUrl() == true) {
      $scope.userInfo = {
        user_nameoremail: "",
        user_password: "",
        user_role: 0,
        url: "login",
      }
    }

    $scope.login = function () {

      if ($scope.userInfo.user_nameoremail == "") {
        alert("Input Your Id or Email");
        return;
      }

      if ($scope.userInfo.user_password == "") {
        alert("Input Password");
        return;
      }

      var data = $.param({
        user_nameoremail: $scope.userInfo.user_nameoremail,
        user_password: $scope.userInfo.user_password,
      });

      $('.background_loading').removeClass('hide');

      $http.post(Server_api_url + 'user_login', data, UserInfo_service.http_config)
        .success(function (data, status, headers, config) {
          if (data.result == 0) {
            $scope.userInfo = {
              user_nameoremail: "",
              user_password: "",
              user_role: 0,
              url: "login",
            }
            alert("Input User Id or Email and Password Correctly");
          }
          else if (data.result == 1) {
            data.userInfo.url = 'bet.' + data.userInfo.user_role + '_dashboard';
            UserInfo_service.setUser(data.userInfo);
            $state.go(data.userInfo.url);
          }
          $('.background_loading').addClass('hide');
        })
        .error(function (data, status, header, config) {
          alert("Your Request Failed!");
          $('.background_loading').addClass('hide');
        });
    }

    function validateEmail(email) {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
    }
  });
