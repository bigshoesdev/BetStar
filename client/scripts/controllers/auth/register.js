'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('betting')
  .controller('RegisterCtrl', function ($rootScope, $http, $scope, $position, $state, UserInfo_service, Server_api_url) {

    $('body').addClass('bg-black');

    $scope.user_info = {
      first_name: '',
      last_name: '',
      birthday: '',
      id: '',
      email: '',
      address: '',
      city: '',
      phonenumber: '',
      password: '',
      password_confirm: '',
    };

    function validateEmail(email) {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
    }

    function alert(text) {
      noty({
        text: '<div><strong>Wrong!</strong> <br /> ' + text + ' !</div>',
        layout: 'topRight',
        closeWith: ['click'],
        timeout: 2000,
        type: 'information',
      });
    }

    $scope.onRegister = function () {

      if ($scope.user_info.first_name == "") {
        alert('Input First Name');
        return;
      }

      if ($scope.user_info.last_name == "") {
        alert('Input Last Name');
        return;
      }

      if ($scope.user_info.birthday == "") {
        alert('Input Birthday');
        return;
      }

      if ($scope.user_info.id == "") {
        alert('Input User Id');
        return;
      }

      if ($scope.user_info.email == "") {
        alert('Input Your Email');
        return;
      }

      if (validateEmail($scope.user_info.email) == false) {
        alert('Input Your Email Correctly');
        return;
      }

      if ($scope.user_info.address == "") {
        alert('Input Your Address');
        return;
      }

      if ($scope.user_info.city == "") {
        alert('Input Your City');
        return;
      }

      if ($scope.user_info.phonenumber == "") {
        alert('Input Your PhoneNumber');
        return;
      }

      if ($scope.user_info.password == "") {
        alert('Input Password');
        return;
      }

      if ($scope.user_info.password_confirm == "") {
        alert('Retype Password');
        return;
      }

      if ($scope.user_info.password != $scope.user_info.password_confirm) {
        alert('Your Password does not Match');
        return;
      }

      swal({
        title: "Register",
        text: "Would you like to register this account?",
        type: "info",
        showCancelButton: true,
        closeOnConfirm: false,
        showLoaderOnConfirm: true
      }, function () {
        var data = $.param({
          user_id: $scope.user_info.id,
          user_email: $scope.user_info.email,
          user_password: $scope.user_info.password,
          user_firstname: $scope.user_info.first_name,
          user_lastname: $scope.user_info.last_name,
          user_birthday: $scope.user_info.birthday,
          user_address: $scope.user_info.address,
          user_city: $scope.user_info.city,
          user_phonenumber: $scope.user_info.phonenumber,
        });

        $http.post(Server_api_url + 'user_signup', data, UserInfo_service.http_config)
          .success(function (data, status, headers, config) {
            if (data.result == -1)
              swal("Error :" + data.message);
            else if (data.result == -2)
              swal("UserId already exists");
            else if (data.result == -3)
              swal("Email already exists");
            else if (data.result == 1) {
              swal("Your account successfully signed up.");
              $state.go('login');
            }
          })
          .error(function (data, status, header, config) {
            swal("Your Request Failed!");
          });
      });

    }

    // setTimeout(function () {
    //   $("#register").bootstrapValidator({
    //     fields: {
    //       first_name: {
    //         validators: {
    //           notEmpty: {
    //             message: 'First name is required'
    //           }
    //         },
    //         required: true,
    //         minlength: 3
    //       },
    //       last_name: {
    //         validators: {
    //           notEmpty: {
    //             message: 'Last name is required'
    //           },
    //         },
    //         required: true,
    //         minlength: 3
    //       },
    //       birthday: {
    //         validators: {
    //           notEmpty: {
    //             message: 'Birthday is required'
    //           },
    //         },
    //         required: true,
    //         minlength: 3
    //       },
    //       id: {
    //         validators: {
    //           notEmpty: {
    //             message: 'User id is required'
    //           },
    //         },
    //         required: true,
    //         minlength: 3
    //       },
    //       email: {
    //         validators: {
    //           notEmpty: {
    //             message: 'The email address is required'
    //           },
    //           emailAddress: {
    //             message: 'The input is not a valid email address'
    //           }
    //         }
    //       },
    //       address: {
    //         validators: {
    //           notEmpty: {
    //             message: 'Address is required'
    //           },
    //         },
    //         required: true,
    //         minlength: 3
    //       },
    //       city: {
    //         validators: {
    //           notEmpty: {
    //             message: 'City is required'
    //           },
    //         },
    //         required: true,
    //         minlength: 3
    //       },
    //       phonenumber: {
    //         validators: {
    //           notEmpty: {
    //             message: 'Phonenumber is required'
    //           },
    //         },
    //         required: true,
    //         minlength: 3
    //       },
    //       password: {
    //         validators: {
    //           notEmpty: {
    //             message: 'Password is required'
    //           },
    //         }
    //       },
    //       password_confirm: {
    //         validators: {
    //           notEmpty: {
    //             message: 'Confirm Password is required'
    //           },
    //           identical: {
    //             field: 'password'
    //           },
    //         }
    //       }
    //     }
    //   });
    // });
  });
