'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('betting')
  .controller('TerminalSaleCtrl', function ($rootScope, $scope, $position, UserInfo_service, $interval, Server_api_url, $http) {

    UserInfo_service.checkUrl();

    $('#heading').text("Admin Terminal Sales Dashboard");
    UserInfo_service.setHeading("Admin Terminal Sales Dashboard");

    // $rootScope.totalsummary = {
    //   total_sale: '30000000',
    //   total_payable: '19000000',
    //   total_winning: '10000000',
    //   bal_agent: '',
    //   bal_company: '9000000',
    //   status: 'green',
    // }
    var data = $.param({});

    $http.post(Server_api_url + 'bet/summary_total', data, UserInfo_service.http_config)
      .success(function (data, status, headers, config) {
        $rootScope.totalsummary = data.total_summary;
      });
    $http.post(Server_api_url + 'bet/summary_terminal', data, UserInfo_service.http_config)
      .success(function (data, status, headers, config) {
        $rootScope.terminal_summary = data.terminal_summary;
      });

    // $rootScope.terminalsummary = [];
    // for (var i = 1; i < 10; i++) {
    //   $rootScope.terminalsummary.push({
    //     id: i,
    //     name: 'Agent ' + (i % 4 + 1),
    //     terminal: 'Terminal ' + (i % 5 + 1),
    //     won_amount: [{ name: '80-1', won_amount: '20000000' }, { name: '40-1', won_amount: '10000000' }],
    //     payable: ['14000000', '5000000'],
    //     total_payable: '19000000',
    //     total_win: '10000000',
    //     bal_agent: '',
    //     bal_company: '9000000',
    //     status: 'green',
    //     show: true,
    //   });
    // }

  });
