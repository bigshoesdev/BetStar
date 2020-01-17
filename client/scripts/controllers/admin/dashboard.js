'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('betting')
  .controller('DashboardCtrl', function ($rootScope, $scope, $position, $route, $location, $templateCache, UserInfo_service, $interval, Server_api_url, $http) {

	UserInfo_service.checkUrl();
	$('body').removeClass('bg-black');
	$('#heading').text("Admin Dashboard");
	UserInfo_service.setHeading("Admin Dashboard");

	var data = $.param({});
	$http.post(Server_api_url + 'bet/details', data, UserInfo_service.http_config)
	  .success(function (data, status, headers, config) {
		$scope.bet_cnt = data.bet_cnt;
		$scope.agent_cnt = data.agent_cnt;
		$scope.terminal_cnt = data.terminal_cnt;
		$scope.deleterequest_cnt = data.deleterequest_cnt;
		$scope.approved_cnt = data.approved_cnt;
		$scope.dismiss_cnt = data.dismiss_cnt;
	  });

	data = $.param({});
	$http.post(Server_api_url + 'bet/summary_total', data, UserInfo_service.http_config)
	  .success(function (data, status, headers, config) {
		$scope.total_summary = data.total_summary;
	  });


  });
