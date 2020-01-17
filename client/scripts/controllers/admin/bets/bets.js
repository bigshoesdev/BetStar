'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('betting')
	.controller('BetsCtrl', function ($rootScope, $scope, $position, UserInfo_service, $interval, Server_api_url, $http) {

		UserInfo_service.checkUrl();

		$('#heading').text("Admin Bets List Dashboard");
		UserInfo_service.setHeading("Admin Bets List Dashboard");

		$rootScope.filter_betstatus = 'Active';

		var data = $.param({});

		$http.post(Server_api_url + 'bet/bet_all', data, UserInfo_service.http_config)
			.success(function (data, status, headers, config) {
				for (var i = 0; i < data.requests.length; i++) {
					var gamelist = [];
					if (data.requests[i].type == "Nap/Perm")
						gamelist = data.requests[i].gamelist;
					else {
						for (var j = 0; j < data.requests[i].gamelist.length; j++)
							gamelist.push(data.requests[i].gamelist[j].under + '(' + data.requests[i].gamelist[j].list.toLocaleString() + ')');
					}
					data.requests[i].gamelist = gamelist.toLocaleString();
				}
				$rootScope.betsummary = data.requests;
			});

	});
