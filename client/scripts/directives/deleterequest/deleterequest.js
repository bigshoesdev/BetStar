'use strict';

/**
 * @ngdoc directive
 * @name izzyposWebApp.directive:adminPosHeader
 * @description
 * # adminPosHeader
 */
angular.module('betting')
  .directive('deleterequest', function () {
	return {
	  templateUrl: 'scripts/directives/deleterequest/deleterequest.html',
	  restrict: 'E',
	  replace: true,
	  scope: {
		canprove: '@',
	  },
	  controller: function ($scope, UserInfo_service, $state, $interval, $location, $http, Server_api_url) {

		$scope.filter = {
		  weekno: "10",
		  repeat: "1",
		  status: "Active",
		  tsn: "",
		  amt: "",
		  bets_above: "",
		  agent: "ALL",
		  terminal: "ALL",
		}

		$scope.agentsales = [
		];

		$scope.agentsaledata = {
		  id: 1,
		  name: 'Agent 1',
		  terminal: 'ALL',
		  odd: '80-1 = 200,000.00 \r\n40-1 = 100,000.00',
		  payable: '140,000.00 \r\n50,000.00',
		  total_payable: '190,000.00',
		  total_win: '100,000.00',
		  bal_agent: '',
		  bal_company: '90,000.00',
		  status: 'GREEN',
		  show: true,
		};

		for (var i = 0; i < 1; i++) {
		  $scope.agentsaledata.id = i;
		  $scope.agentsales.push(angular.copy($scope.agentsaledata));
		}

		$scope.betdata = {
		  no: 1,
		  bet_id: 111,
		  player: 'Player1',
		  option: '100-1',
		  under: 'U3',
		  week: 10 + i % 5,
		  amt: '1000',
		  game_list: '1,2,3,4',
		  score_list: '1,2',
		  apl: 100,
		  status: 'Active',
		  win_result: 'Win',
		  odd: '10000',
		  tsn: 12234,
		  terminal: 'Terminal 1',
		  agent: 'Agent 1',
		  bet_time: '2018/5/4 12:30:21',
		  repeat: 0,
		  same_as: -1,
		  show: true,
		};

		$scope.betsdata = [];
		for (var i = 0; i < 15; i++) {
		  $scope.betdata.no = i;
		  $scope.betdata.tsn++;
		  $scope.betsdata.push(angular.copy($scope.betdata));
		}

		for (var i = 0; i < $scope.betsdata.length; i++) {
		  $scope.betsdata[i].repeat = 0;
		  if ($scope.betsdata[i].same_as == -1) {
			for (var j = 0; j < $scope.betsdata.length; j++) {
			  if ($scope.betsdata[i].game_list == $scope.betsdata[j].game_list) {
				$scope.betsdata[i].repeat++;
				$scope.betsdata[j].same_as = i;
			  }
			}
		  }
		  else {
			$scope.betsdata[i].repeat = $scope.betsdata[$scope.betsdata[i].same_as].repeat;
		  }
		}

		var betsTable;

		var clearTable = function (table) {
		  table.fnClearTable();
		}

		$scope.timer = $interval(function () {
		  betsTable = $('#betsTable').dataTable({
			"sScrollX": '99%',
			"dom": 'Bfrtip',
			"buttons": [
			  'copy', 'csv', 'excel', 'pdf', 'print'
			]
		  });

		  $interval.cancel($scope.timer);
		}, 100);

		$scope.onfilterchanged = function (filterid) {

		  clearTable(betsTable);
		  for (var i = 0; i < $scope.betsdata.length; i++) {

			if ($scope.betsdata[i].week != $scope.filter.weekno)
			  show = false;

			else if ($scope.betsdata[i].repeat < $scope.filter.repeat)
			  show = false;

			else if ($scope.betsdata[i].status != $scope.filter.status)
			  show = false;

			else if ($scope.betsdata[i].tsn.toString().search($scope.filter.tsn) == -1 && $scope.filter.tsn != "")
			  show = false;

			else if ($scope.betsdata[i].amt.toString().search($scope.filter.amt) == -1 && $scope.filter.amt != "")
			  show = false;

			else if ($scope.betsdata[i].odd < $scope.filter.bets_above && $scope.filter.bets_above != "")
			  show = false;

			else if ($scope.betsdata[i].agent != $scope.filter.agent && $scope.filter.agent != "ALL")
			  show = false;

			else if ($scope.betsdata[i].terminal != $scope.filter.terminal && $scope.filter.terminal != "ALL")
			  show = false;

			else {
			  betsTable.fnAddData([
				$scope.betsdata[i].no,
				$scope.betsdata[i].bet_id,
				$scope.betsdata[i].player,
				$scope.betsdata[i].option,
				$scope.betsdata[i].under,
				$scope.betsdata[i].week,
				$scope.betsdata[i].amt,
				$scope.betsdata[i].game_list,
				$scope.betsdata[i].score_list,
				$scope.betsdata[i].status,
				$scope.betsdata[i].win_result,
				$scope.betsdata[i].odd,
				$scope.betsdata[i].tsn,
				$scope.betsdata[i].terminal,
				$scope.betsdata[i].agent,
				$scope.betsdata[i].bet_time,
			  ]);
			}
		  }
		}

		$('#betsTable').on('click', '.approve', function (e) {
		  var id = $(this).closest('tr').data('id');

		  var data = $.param({ _id: id });

		  $http.post(Server_api_url + 'bet/bet_void', data, UserInfo_service.http_config)
			.success(function (data, status, headers, config) {
			  if (data.result == 1)
				betsTable.fnDeleteRow($('[data-id=' + id + ']')[0]);
			  else
				alert(data.message);
			})
		});

		$('#betsTable').on('click', '.dismiss', function (e) {
		  var id = $(this).closest('tr').data('id');
		  var data = $.param({ _id: id });

		  $http.post(Server_api_url + 'bet/bet_dismiss', data, UserInfo_service.http_config)
			.success(function (data, status, headers, config) {
			  if (data.result == 1)
				betsTable.fnDeleteRow($('[data-id=' + id + ']')[0]);
			  else
				alert(data.message);
			})
		});
	  }

	}

  });