'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('betting')
  .controller('AgentSaleCtrl', function ($rootScope, $scope, $position, UserInfo_service, $interval, $http, Server_api_url) {

	UserInfo_service.checkUrl();

	$('#heading').text("Admin Agent Sales Dashboard");
	UserInfo_service.setHeading("Admin Agent Sales Dashboard");

	var data = $.param({ agent_id: UserInfo_service.getUser().user_id });

	$http.post(Server_api_url + 'bet/summary_total', data, UserInfo_service.http_config)
	  .success(function (data, status, headers, config) {
		$rootScope.totalsummary = data.total_summary;
	  });

	// $rootScope.agentsummary = [];
	// for (var i = 1; i < 5; i++) {
	//   $rootScope.agentsummary.push({
	//	 id: i,
	//	 name: 'Agent ' + i,
	//	 terminal: 'ALL',
	//	 won_amount: [{ name: '80-1', won_amount: '20000000' }, { name: '40-1', won_amount: '10000000' }],
	//	 payable: ['14000000', '5000000'],
	//	 total_payable: '19000000',
	//	 total_win: '10000000',
	//	 bal_agent: '',
	//	 bal_company: '9000000',
	//	 status: 'green',
	//	 show: true,
	//   });
	// }
	// $rootScope.agentsummary = [];
	// for (var i = 0; i < 4; i++) {
	//   for (var j = 0; j < 3; j++) {
	//	 $rootScope.agentsummary.push({
	//	   id: i * 3 + j + 1,
	//	   name: 'Agent ' + i,
	//	   terminal: 'Terminal ' + j,
	//	   won_amount: [{ name: '80-1', won_amount: '20000000' }, { name: '40-1', won_amount: '10000000' }],
	//	   payable: ['14000000', '5000000'],
	//	   total_payable: 19000000 * 3,
	//	   win: 10000000,
	//	   total_win: 10000000 * 3,
	//	   bal_agent: '',
	//	   bal_company: 9000000 * 3,
	//	   status: 'green',
	//	   show: true,
	//	 });
	//   }
	// }
	$http.post(Server_api_url + 'bet/summary_agent', data, UserInfo_service.http_config)
	  .success(function (data, status, headers, config) {
		$rootScope.agentsummary = data.agent_summary;
	  });

  });
