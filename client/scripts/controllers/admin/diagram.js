'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('betting')
	.controller('DiagramCtrl', function ($rootScope, $scope, $position, UserInfo_service, $interval, $http, Server_api_url, $state) {

		UserInfo_service.checkUrl();

		$('#heading').text("Admin Diagram Dashboard");
		UserInfo_service.setHeading("Admin Diagram Dashboard");

		var table = $('#diagramTable');

		var data = $.param({});

		var diagramTable;

		$http.post(Server_api_url + 'terminal/terminal_distribution', data, UserInfo_service.http_config)
			.success(function (data, status, headers, config) {
				if (data.result == 1) {
					$scope.terminals = data.terminals;
					var timer = $interval(function () {
						diagramTable = $('#diagramTable').dataTable({
							"sScrollX": '99%',
							"dom": 'Bfrtip',
							"buttons": [
								'copy', 'csv', 'excel', 'pdf', 'print'
							],
							rowsGroup: [0, 1],
						});

						$interval.cancel(timer);
					}, 100);
				}
			})

		table.on('click', '.tmnid', function (e) {
			$rootScope.filter_terminal = $(this)[0].innerText;
			$state.go('bet.admin_terminalsales');
		})
		table.on('click', '.agtid', function (e) {
			$rootScope.filter_agent = $(this)[0].innerText;
			$state.go('bet.admin_agentsales');
		})
		table.on('click', '.stfid', function (e) {
			$rootScope.filter_staff = $(this)[0].innerText;
			$state.go('bet.admin_staffsales');
		})
	});
