'use strict';

/**
 * @ngdoc directive
 * @name izzyposWebApp.directive:adminPosHeader
 * @description
 * # adminPosHeader
 */
angular.module('betting')
	.directive('headerNotification', function () {
		return {
			templateUrl: 'scripts/directives/header/header-notification/header-notification.html',
			restrict: 'E',
			replace: true,
			scope: {},
			controller: function ($scope, UserInfo_service, $state, $interval, $location, $templateCache, $http, Server_api_url, $rootScope) {

				$scope.user_role = UserInfo_service.getUserRole();

				var data = $.param({ status: "Waiting" });
				$http.post(Server_api_url + 'wallet/request_all', data, UserInfo_service.http_config)
					.success(function (data, status, headers, config) {
						$rootScope.deposit_requests = data.requests;
					});

				$interval(function () {
					$('#page-wrapper').css('min-height', Math.max($('.navbar-default .sidebar').height(), window.innerHeight - 50) + 'px');
				}, 200);

				if ($('#currentTime') != undefined && $('#currentTime') != null) {
					$('#currentTime')[0].innerText = new Date().toDateString() + " " + new Date().toTimeString().split(" ")[0];

					$interval(function () {
						if ($location.path().search('bet') != -1)
							$('#currentTime')[0].innerText = new Date().toDateString() + " " + new Date().toTimeString().split(" ")[0];
					}, 100);
				}

				$scope.logout = function () {
					UserInfo_service.deleteUser();
					UserInfo_service.setHeading('');
					$templateCache.removeAll();
					window.location.replace('#/login');
					window.location.reload();
				}
			},
		}
	});
