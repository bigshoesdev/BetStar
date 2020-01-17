'use strict';

/**
 * @ngdoc directive
 * @name izzyposWebApp.directive:adminPosHeader
 * @description
 * # adminPosHeader
 */
angular.module('betting')
	.directive('header', function () {
		return {
			templateUrl: 'scripts/directives/header/header.html',
			restrict: 'E',
			replace: true,
			scope: {},
			controller: function ($scope, UserInfo_service, $state, $interval, $location, $rootScope) {
				$scope.defaulturl = UserInfo_service.getDefaultUrl();

				if (UserInfo_service.getHeading() == "" || UserInfo_service.getHeading() == undefined || UserInfo_service.getHeading().search("Welcome ") == -1) {
					$scope.heading = UserInfo_service.getUserRole();
					$scope.heading += " Dashboard";
					UserInfo_service.setHeading($scope.heading);
				}
				else {
					$scope.heading = UserInfo_service.getHeading();
					if (UserInfo_service.getHeading() == "Welcome ")
						$scope.username = UserInfo_service.getUserName();
					else
						$scope.username = "";
				}
			},
		}
	});


