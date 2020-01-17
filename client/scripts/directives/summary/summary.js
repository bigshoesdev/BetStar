'use strict';

/**
 * @ngdoc directive
 * @name izzyposWebApp.directive:adminPosHeader
 * @description
 * # adminPosHeader
 */
angular.module('betting')
	.directive('summary', function () {
		return {
			templateUrl: 'scripts/directives/summary/summary.html',
			restrict: 'E',
			replace: true,
			scope: {
				'title': '@',
				'filtertype': '@',
				'totalsummary': '@',
				'usersummary': '@',
				'agentsummary': '@',
				'staffsummary': '@',
				'terminalsummary': '@',
				'betsummary': '@',
				'winlist': '@',
				'removescorelist': '@',
				'samebetrepeatasc': '@',
				'voidenable': '@',
				'statushide': '@',
			},
			controller: function ($scope, UserInfo_service, $state, $interval, $location, $rootScope, Server_api_url, $http) {

				$scope.filtershow = [
					[false, false, false, false, false, false, false, false, false, false],
					[true, true, true, true, true, true, true, true, true, false],
					[true, true, true, true, true, true, false, true, false, false],
					[true, false, false, false, false, false, true, false, false, false],
					[true, true, true, true, true, true, true, true, true, true],
					[true, true, true, true, true, true, false, false, false, false],
					[true, false, false, false, false, false, true, true, false, true],
					[true, false, false, false, false, false, false, false, false, true],
					[false, false, false, false, false, false, true, true, false, false],
					[true, false, false, false, false, false, false, false, false, false],
				];

				$scope.filtersize = [0, 2, 2, 4, 2, 2];
				$scope.user_role = UserInfo_service.getUserRole();

				var data = $.param({});

				$http.post(Server_api_url + 'setting/get_setting', data, UserInfo_service.http_config)
					.success(function (data, status, headers, config) {
						if (data.result == 1) {
							$rootScope.currentweek = data.setting.current_week;
							$rootScope.allweek = [];
							for (var i = 0; i < data.all_weeks.length; i++)
								$rootScope.allweek.push(data.all_weeks[i].week_no);
							$rootScope.alloption = [];
							for (var i = 0; i < data.cur_week.options.length; i++)
								$rootScope.alloption.push(data.cur_week.options[i].name);
						}
						$rootScope.allstaff = [];
						$rootScope.allagent = [];
						$rootScope.allterminal = [];

						if (UserInfo_service.getUserRole() == 'admin') {
							var data = $.param({ user_role: 'staff' });
							$http.post(Server_api_url + 'user/user_all', data, UserInfo_service.http_config)
								.success(function (data, status, headers, config) {
									if (data.result == 1) {
										for (var i = 0; i < data.users.length; i++)
											$rootScope.allstaff.push(data.users[i].user_id);
									}
								})

							data = $.param({ user_role: 'agent' });
							$http.post(Server_api_url + 'user/user_all', data, UserInfo_service.http_config)
								.success(function (data, status, headers, config) {
									if (data.result == 1) {
										for (var i = 0; i < data.users.length; i++)
											$rootScope.allagent.push(data.users[i].user_id);
									}
								})

							data = $.param({});

							$http.post(Server_api_url + 'terminal/terminal_all', data, UserInfo_service.http_config)
								.success(function (data, status, headers, config) {
									if (data.result == 1) {
										for (var i = 0; i < data.terminals.length; i++)
											$rootScope.allterminal.push(data.terminals[i].terminal_no);
									}
								})
						}
						else if (UserInfo_service.getUserRole() == 'agent') {
							$rootScope.allagent.push(UserInfo_service.getUser().user_id);

							data = $.param({ agent_id: UserInfo_service.getUser().user_id });

							$http.post(Server_api_url + 'terminal/terminal_all', data, UserInfo_service.http_config)
								.success(function (data, status, headers, config) {
									for (var i = 0; i < data.terminals.length; i++)
										$rootScope.allterminal.push(data.terminals[i].terminal_no);
								})
						}
						else if (UserInfo_service.getUserRole() == 'staff') {
							var data = $.param({ user_role: 'agent', user_staff: UserInfo_service.getUser().user_id });
							$http.post(Server_api_url + 'user/user_all', data, UserInfo_service.http_config)
								.success(function (data, status, headers, config) {
									if (data.result == 1) {
										$rootScope.allagent = [];
										for (var i = 0; i < data.users.length; i++) {
											$rootScope.allagent.push(data.users[i].user_id);
											var snd = $.param({ agent_id: data.users[i].user_id });

											$http.post(Server_api_url + 'terminal/terminal_all', snd, UserInfo_service.http_config)
												.success(function (result, status, headers, config) {
													for (var i = 0; i < result.terminals.length; i++)
														$rootScope.allterminal.push(result.terminals[i].terminal_no);
												})
										}
									}
								})
						}

						$scope.filter = {
							weekno: $rootScope.currentweek,
							repeat: "",
							status: $rootScope.filter_betstatus == undefined ? 'ALL' : $rootScope.filter_betstatus,
							tsn: "",
							amt: "",
							bets_above: "",
							staff: $rootScope.filter_staff ? $rootScope.filter_staff : "ALL",
							agent: $rootScope.filter_agent ? $rootScope.filter_agent : "ALL",
							terminal: $rootScope.filter_terminal ? $rootScope.filter_terminal : "ALL",
							option: "ALL",
							repeatorder: "",
						}

						$rootScope.filter_staff = "ALL";
						$rootScope.filter_agent = "ALL";
						$rootScope.filter_terminal = "ALL";

						var totalsummarytable, usersummarytable, agentsummarytable, staffsummarytable, terminalsummarytable, betsummarytable;
						var filter0 = function (settings, data, dataIndex) { return true };
						var filter1 = function (settings, data, dataIndex) { return true };
						var filter2 = function (settings, data, dataIndex) { return true };

						var timer = $interval(function () {

							$.fn.dataTable.ext.search[0] = filter1;
							$.fn.dataTable.ext.search[1] = filter2;

							if ($scope.totalsummary) {
								totalsummarytable = $('#totalsummary').dataTable({
									"sScrollX": '99%',
									"dom": 'Bfrtip',
									"bPaginate": false,
									"bInfo": false,
									"buttons": [
										'copy', 'csv', 'excel', 'pdf', 'print'
									],
									"bFilter": false,
								});
							}

							if ($scope.usersummary) {
								usersummarytable = $('#usersummarytable').dataTable({
									"sScrollX": '99%',
									"dom": 'Bfrtip',
									"bPaginate": false,
									"bInfo": false,
									"buttons": [
										'copy', 'csv', 'excel', 'pdf', 'print'
									],
									"bFilter": false,
								});
							}

							if ($scope.terminalsummary) {
								terminalsummarytable = $('#terminalsummary').dataTable({
									"sScrollX": '99%',
									"dom": 'Bfrtip',
									"buttons": [
										'copy', 'csv', 'excel', 'pdf', 'print'
									],
								});
								terminalsummarytable.fnSort([[0, 'asc']]);
							}

							if ($scope.betsummary) {
								betsummarytable = $('#betsummary').dataTable({
									"sScrollX": '99%',
									"dom": 'Bfrtip',
									"buttons": [
										'copy', 'csv', 'excel', 'pdf', 'print'
									],
								});
								// betsummarytable.api().rows.add($rootScope.betsummary);
								betsummarytable.fnSetColumnVis(17, false, true);
								betsummarytable.fnSetColumnVis(18, false, true);
								betsummarytable.fnSetColumnVis(19, false, true);

								betsummarytable.fnFilter($scope.filter.weekno, 5);
								if ($scope.filter.status != 'ALL')
									betsummarytable.fnFilter($scope.filter.status, 10);

								calcRepeat();
								betsummarytable.fnDraw();
							}

							if ($scope.agentsummary) {
								agentsummarytable = $('#agentsummary').dataTable({
									"sScrollX": '99%',
									"dom": 'Bfrtip',
									"buttons": [
										'copy', 'csv', 'excel', 'pdf', 'print'
									],
									rowsGroup: [0, 1, 5, 7, 8, 9, 10],
								});

								agentsummarytable.fnFilter('', 0);
							}

							if ($scope.staffsummary) {
								staffsummarytable = $('#staffsummary').dataTable({
									"sScrollX": '99%',
									"dom": 'Bfrtip',
									"buttons": [
										'copy', 'csv', 'excel', 'pdf', 'print'
									],
								});
							}

							$scope.onfilterchanged(6);
							$scope.onfilterchanged(7);
							$scope.onfilterchanged(10);

							$interval.cancel(timer);
						}, 100);

						$('#betsummary').on('click', '.void', function (e) {
							var id = $(this).closest('tr').data('id');

							var data = $.param({ _id: id });
							var nRow = $(this).parents('tr')[0];

							$http.post(Server_api_url + 'bet/bet_void', data, UserInfo_service.http_config)
								.success(function (data, status, headers, config) {
									if (data.result == 1) {
										betsummarytable.fnUpdate('Void', nRow, 10, true);
										betsummarytable.fnUpdate('<a class="unvoid" href="javascript:;">Unvoid</a>', nRow, 20, true);
									}
									else
										alert(data.message);
								})
						});

						$('#betsummary').on('click', '.unvoid', function (e) {
							var id = $(this).closest('tr').data('id');

							var data = $.param({ _id: id });
							var nRow = $(this).parents('tr')[0];

							$http.post(Server_api_url + 'bet/bet_unvoid', data, UserInfo_service.http_config)
								.success(function (data, status, headers, config) {
									if (data.result == 1) {
										betsummarytable.fnUpdate('Active', nRow, 10, true);
										betsummarytable.fnUpdate('<a class="void" href="javascript:;">Void</a>', nRow, 20, true);
									}
									else
										alert(data.message);
								})
						});

						var calcRepeat = function () {
							var datas = betsummarytable.api().rows({ filter: 'applied' }).data();
							var repeats = Array(datas.length);
							var sameas = Array(datas.length);
							for (var i = 0; i < datas.length; i++) {
								if (sameas[i] != undefined) {
									repeats[i] = repeats[sameas[i]];
								}
								else {
									repeats[i] = 1;
									for (var j = i + 1; j < datas.length; j++) {
										if (datas[i][6] == datas[j][6]) {
											repeats[i]++;
											sameas[j] = i;
										}
									}
								}
								betsummarytable.fnUpdate(repeats[i], datas[i][0] - 1, 17, false, false);
							}
						}

						$scope.onfilterchanged = function (filterid) {
							if ($scope.betsummary) {
								switch (filterid) {
									case 0:
										betsummarytable.fnFilter($scope.filter.weekno, 5);
										break;
									case 1:
										filter1 = function (settings, data, dataIndex) {
											if ($scope.filter.repeat == null || $scope.filter.repeat == '')
												return 1;
											return parseInt(data[17], 10) >= parseInt($scope.filter.repeat, 10);
										};
										$.fn.dataTable.ext.search[0] = filter1;
										break;
									case 9:
										if ($scope.filter.repeatorder == "Increasing")
											betsummarytable.fnSort([[17, 'asc'], [6, 'asc']]);
										else if ($scope.filter.repeatorder == "Decreasing")
											betsummarytable.fnSort([[17, 'desc'], [6, 'asc']]);
										break;
									case 2:
										if ($scope.filter.status == "ALL")
											betsummarytable.fnFilter('', 10);
										else
											betsummarytable.fnFilter($scope.filter.status, 10);
										break;
									case 3:
										betsummarytable.fnFilter($scope.filter.tsn, 13);
										break;
									case 4:
										betsummarytable.fnFilter($scope.filter.amt, 19);
										break;
									case 5:
										filter2 = function (settings, data, dataIndex) {
											if ($scope.filter.bets_above == null || $scope.filter.bets_above == '')
												return 1;
											return parseInt(data[$scope.winlist ? 18 : 19], 10) >= parseInt($scope.filter.bets_above, 10);
										};
										$.fn.dataTable.ext.search[1] = filter2;
										betsummarytable.fnDraw();
										break;
									case 6:
										if ($scope.filter.agent == 'ALL')
											betsummarytable.fnFilter('', 15);
										else
											betsummarytable.fnFilter($scope.filter.agent, 15);
										break;
									case 7:
										if ($scope.filter.terminal == 'ALL')
											betsummarytable.fnFilter('', 14);
										else
											betsummarytable.fnFilter($scope.filter.terminal, 14);
										break;
									case 8:
										if ($scope.filter.option == 'ALL')
											betsummarytable.fnFilter('', 3);
										else
											betsummarytable.fnFilter($scope.filter.option, 3);
										break;
								}

								if (filterid != 1)
									calcRepeat();
								betsummarytable.fnDraw();

							}

							if ($scope.staffsummary) {
								switch (filterid) {
									case 10:
										if ($scope.filter.staff == 'ALL')
											staffsummarytable.fnFilter('', 0);
										else
											staffsummarytable.fnFilter($scope.filter.staff, 0);
										break;
								}
							}

							if ($scope.agentsummary) {
								switch (filterid) {
									case 10:
										if ($scope.filter.staff == 'ALL')
											agentsummarytable.fnFilter('', 0);
										else
											agentsummarytable.fnFilter($scope.filter.staff, 0);
										break;
									case 6:
										if ($scope.filter.agent == 'ALL')
											agentsummarytable.fnFilter('', 1);
										else
											agentsummarytable.fnFilter($scope.filter.agent, 1);
										break;
									case 7:
										if ($scope.filter.terminal == 'ALL')
											agentsummarytable.fnFilter('', 2);
										else
											agentsummarytable.fnFilter($scope.filter.terminal, 2);
										break;
								}
							}

							if ($scope.terminalsummary) {
								switch (filterid) {
									case 6:
										if ($scope.filter.agent == 'ALL')
											terminalsummarytable.fnFilter('', 0);
										else
											terminalsummarytable.fnFilter($scope.filter.agent, 0);
										break;
									case 7:
										if ($scope.filter.terminal == 'ALL')
											terminalsummarytable.fnFilter('', 1);
										else
											terminalsummarytable.fnFilter($scope.filter.terminal, 1);
										break;
								}
							}

							// if (filterid != 1) {
							//   calcRepeat();
							// }
						}
					})
			}
		}
	});