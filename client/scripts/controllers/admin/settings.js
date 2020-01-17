'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('betting')
	.controller('SettingsCtrl', function ($rootScope, $scope, $position, UserInfo_service, $interval, $http, Server_api_url, $state, $location) {

		UserInfo_service.checkUrl();

		$('#heading').text("Admin Settings Dashboard");
		UserInfo_service.setHeading("Admin Settings Dashboard");

		var data = $.param({});

		$http.post(Server_api_url + 'setting/get_setting', data, UserInfo_service.http_config)
			.success(function (data, status, headers, config) {
				if (data.result == -1) {
					alert(data.message);
				}
				else if (data.result == 1) {
					$scope.risk_manager = data.setting.risk_manager[0];
					$scope.current_week = data.cur_week;
					$scope.options = data.cur_week.options;
					$scope.weeks = data.all_weeks;
					$scope.selected_week = angular.copy(data.cur_week);
					$scope.bet_cnt = data.bet_cnt;
					$scope.credittoadd = 0;
					var counter = $scope.options.length + 1;

					$scope.set_curweek = function () {
						var data = $.param({ current_week: $scope.selected_week.week_no });

						$http.post(Server_api_url + 'setting/set_current', data, UserInfo_service.http_config)
							.success(function (data, status, headers, config) {
								if (data.result == 1) {
									window.location.reload();
								}
								else {
									alert(data.message);
								}
							})
							.error(function (data, status, headers, config) {
								alert("connection error");
							})
					}

					$scope.setRiskManager = function () {
						var data = $.param($scope.risk_manager);

						$http.post(Server_api_url + 'setting/set_riskmanager', data, UserInfo_service.http_config)
							.success(function (data, status, headers, config) {
								if (data.result == 1) {
									alert("success");
								}
								else {
									alert(data.message);
								}
							})
							.error(function (data, status, headers, config) {
								alert("connection error");
							})
					}

					$scope.addCommission = function () {
						if (nEditing !== null && nEditing != nRow) {
							/* Currently editing - but not this row - restore the old before continuing to edit mode */
							$('#editConfirmModal').modal();
						}
						else {
							var data = $.param({ name: counter + '-1' });

							$http.post(Server_api_url + 'setting/option_add', data, UserInfo_service.http_config)
								.success(function (data, status, headers, config) {
									if (data.result == 1) {
										var aiNew = oTable.fnAddData([
											counter,
											counter + '-1',
											'<button type="button" data-id=' + counter + '-1' + ' class="btn_optsts btn btn-success btn-circle"><i class="fa fa-check"></i></button>',
											'<a class="edit" href="javascript:;">Edit</a>',
											'<a class="delete" href="javascript:;">Delete</a>',
										]);

										var nRow = oTable.fnGetNodes(aiNew[0]);
										nRow.dataset["id"] = counter;

										nEditing = nRow;
										counter++;
										editRow(oTable, nRow);
									}
									else {
										alert(data.message);
									}
								})
								.error(function (data, status, headers, config) {
								});
						}
					}

					function restoreRow(oTable, nRow) {
						var aData = oTable.fnGetData(nRow);
						var jqTds = $('>td', nRow);

						for (var i = 0, iLen = jqTds.length; i < iLen; i++) {
							oTable.fnUpdate(aData[i], nRow, i, false);
						}

						oTable.fnDraw();
					}

					function editRow(oTable, nRow) {
						var aData = oTable.fnGetData(nRow);
						var jqTds = $('>td', nRow);
						jqTds[1].innerHTML = '<input type="text" class="form-control input-small" value="' + aData[1] + '">';
						jqTds[3].innerHTML = '<a class="edit" href="">Save</a>';
						jqTds[4].innerHTML = '<a class="cancel" href="">Cancel</a>';
						oTable.fnDraw();
					}

					function saveRow(oTable, nRow) {
						var aData = oTable.fnGetData(nRow);
						var jqInputs = $('input', nRow);
						var data = $.param({ oldname: aData[1], newname: jqInputs[0].value });

						if (aData[1] == jqInputs[0].value) {
							restoreRow(oTable, nRow);
							return;
						}

						$http.post(Server_api_url + 'setting/option_edit', data, UserInfo_service.http_config)
							.success(function (data, status, headers, config) {
								if (data.result == 1) {
									$('[data-id="' + aData[1] + '"]')[0].dataset['id'] = jqInputs[0].value;
									oTable.fnUpdate(jqInputs[0].value, nRow, 1, false);
									oTable.fnUpdate('<a class="edit" href="">Edit</a>', nRow, 3, false);
									oTable.fnUpdate('<a class="delete" href="">Delete</a>', nRow, 4, false);
									oTable.fnDraw();
								}
								else {
									alert(data.message);
								}
							})
							.error(function (data, status, headers, config) {
							})

						// oTable.fnUpdate(jqInputs[0].value, nRow, 0, false);
					}

					function cancelEditRow(oTable, nRow) {
						var jqInputs = $('input', nRow);
						// oTable.fnUpdate(jqInputs[0].value, nRow, 0, false);
						oTable.fnUpdate(jqInputs[0].value, nRow, 1, false);
						oTable.fnUpdate('<a class="edit" href="">Edit</a>', nRow, 3, false);
						oTable.fnDraw();
					}

					var table = $('#commissionTable');
					var oTable;

					setTimeout(function () {
						oTable = table.dataTable({
							"order": [
								[0, "desc"]
							],

							// set the initial value
							"sScrollX": '99%',
							"scrollCollapse": true,
							"language": {
								"lengthMenu": " _MENU_ records"
							}, dom: 'Bfrtip',
							buttons: [
								'copy', 'csv', 'excel', 'pdf', 'print'
							],
						});
					});

					var tableWrapper = $("#gameTable_wrapper");

					tableWrapper.find(".dataTables_length select").select2({
						showSearchInput: false //hide search box with special css class
					}); // initialize select2 dropdown

					var nEditing = null;
					var nNew = false;

					$('#gameTable_new').click(function (e) {
						e.preventDefault();

						if (nNew && nEditing) {
							if (confirm("Previose row not saved. Do you want to save it ?")) {
								saveRow(oTable, nEditing); // save
								$(nEditing).find("td:first").html("Untitled");
								nEditing = null;
								nNew = false;

							} else {
								oTable.fnDeleteRow(nEditing); // cancel
								nEditing = null;
								nNew = false;

								return;
							}
						}

						var aiNew = oTable.fnAddData(['', '', '', '', '', '']);
						var nRow = oTable.fnGetNodes(aiNew[0]);
						editRow(oTable, nRow);
						nEditing = nRow;
						nNew = true;
					});

					table.on('click', '.btn_optsts', function (e) {
						e.preventDefault();

						var btn = this;
						var id = this.dataset['id'];
						var newstatus = $(btn).hasClass('btn-danger');						

						var data = $.param({
							option: id,
							status: newstatus,
						});

						$http.post(Server_api_url + 'setting/option_editstatus', data, UserInfo_service.http_config)
							.success(function (data, status, headers, config) {
								if (data.result == 1) {
									if (newstatus) {
										$(btn).removeClass('btn-danger');
										$(btn).addClass('btn-success');
										btn.innerHTML = '<i class="fa fa-check"></i>';
									}
									else {
										$(btn).removeClass('btn-success');
										$(btn).addClass('btn-danger');
										btn.innerHTML = '<i class="fa fa-times"></i>';
									}
								}
							});

					})

					table.on('click', '.delete', function (e) {
						e.preventDefault();

						if (nEditing !== null && nEditing != nRow) {
							/* Get the row as a parent of the link that was clicked on */
							var nRow = $(this).parents('tr')[0];

							if (nEditing !== null && nEditing != nRow) {
								/* Currently editing - but not this row - restore the old before continuing to edit mode */
								$('#editConfirmModal').modal();
							} else if (nEditing == nRow && this.innerHTML == "Save") {
								/* Editing this row and want to save it */
								saveRow(oTable, nEditing);
								nEditing = null;
								// $('#saveConfirmModal').modal();
							}
						}
						else {
							var id = $(this).closest('tr').data('id');
							$('#deleteConfirmModal').data('id', id).modal('show');
						}
					});

					$('#delete_item').click(function () {
						var id = $('#deleteConfirmModal').data('id');
						var data = $.param({ name: $('[data-id=' + id + ']')[0].cells[1].innerText });

						$http.post(Server_api_url + 'setting/option_delete', data, UserInfo_service.http_config)
							.success(function (data, status, headers, config) {
								if (data.result == 1) {
									oTable.fnDeleteRow($('[data-id=' + id + ']')[0]);
								}
								else {
									alert(data.message);
								}
							})
							.error(function (data, status, headers, config) {
								alert("connection error");
							})

						$('#deleteConfirmModal').modal('hide');
					});

					table.on('click', '.cancel', function (e) {
						e.preventDefault();

						if (nNew) {
							oTable.fnDeleteRow(nEditing);
							nNew = false;
						} else {
							restoreRow(oTable, nEditing);
							nEditing = null;
						}
					});

					table.on('click', '.edit', function (e) {
						e.preventDefault();

						/* Get the row as a parent of the link that was clicked on */
						var nRow = $(this).parents('tr')[0];

						if (nEditing !== null && nEditing != nRow) {
							/* Currently editing - but not this row - restore the old before continuing to edit mode */
							$('#editConfirmModal').modal();
						} else if (nEditing == nRow && this.innerHTML == "Save") {
							/* Editing this row and want to save it */
							saveRow(oTable, nEditing);
							nEditing = null;
							// $('#saveConfirmModal').modal();
						} else {
							/* No edit in progress - let's start one */
							editRow(oTable, nRow);
							nEditing = nRow;
						}
					});

					/************************************************************
					 *					  Week Settings					   *
					 ************************************************************/

					var current = new Date();

					// alert(current.toISOString());

					$scope.weekmodel = {
						week_no: "",
						start_at: "",
						close_at: "",
						validity: "",
						void_bet: "00:30:00",
					};

					var start_at = flatpickr("#start_at", { minDate: new Date() });
					var close_at = flatpickr("#close_at", { minDate: new Date() });
					var validity = flatpickr("#validity", { minDate: new Date() });
					// var voidbets = flatpickr("#voidbets", { minDate: new Date() });
					// $('#voidbet').timepicker({
					//   minuteStep: 1,
					//   showSeconds: true,
					//   showMeridian: false,
					// })


					start_at.set("onChange", function (d) {
						close_at.set("minDate", d.fp_incr(1)); //increment by one day
					});
					close_at.set("onChange", function (d) {
						start_at.set("maxDate", d);
						validity.set('minDate', d.fp_incr(1));
					});

					$scope.onNewWeek = function () {

						if ($scope.weekmodel.week_no == "" || $scope.weekmodel.week_no == null) {
							alert("Input Week No");
							return;
						}

						$scope.weekmodel.start_at = $('#start_at').val();

						if ($scope.weekmodel.start_at == "" || $scope.weekmodel.start_at == null) {
							alert("Input Start Date");
							return;
						}

						$scope.weekmodel.close_at = $('#close_at').val();

						if ($scope.weekmodel.close_at == "" || $scope.weekmodel.close_at == null) {
							alert("Input Close Date");
							return;
						}

						$scope.weekmodel.validity = $('#validity').val();

						if ($scope.weekmodel.validity == "" || $scope.weekmodel.validity == null) {
							alert("Input Validity");
							return;
						}

						if ($scope.weekmodel.void_bet == "" || $scope.weekmodel.void_bet == null || $scope.weekmodel.void_bet.length != 8) {
							alert("Input Void Bet Time");
							return;
						}

						// var startDate = Date.parse($scope.weekmodel.start_at);
						// var closeDate = Date.parse($scope.weekmodel.close_at);
						// var validityDate = Date.parse($scope.weekmodel.validity);
						// var voidbetTime = Date.parse($scope.weekmodel.void_bet);

						var void_bet = $scope.weekmodel.void_bet;


						var data = $.param({
							week_no: $scope.weekmodel.week_no,
							start_at: $scope.weekmodel.start_at,
							close_at: $scope.weekmodel.close_at,
							validity: $scope.weekmodel.validity,
							void_bet: (void_bet.substr(0, 2) * 3600 + void_bet.substr(3, 2) * 60 + void_bet.substr(6, 2)) * 1000,
						});

						// var data = $.param({
						//   week_no: $scope.weekmodel.week_no,
						//   start_at: startDate,
						// });

						$http.post(Server_api_url + 'week/week_edit', data, UserInfo_service.http_config)
							.success(function (data, status, headers, config) {
								alert('success');
								window.location.reload();
							})
							.error(function (data, status, header, config) {
								alert('fail');
							});
						// alert($scope.weekmodel);
						// alert($scope.weekmodel.start_at);
					};
				}
			})
			.error(function (data, status, header, config) {
				alert("Could not connect to Server");
			});

		$scope.onClearPlacedBet = function () {
			var data = $.param({});

			$http.post(Server_api_url + 'bet/clearbets', data, UserInfo_service.http_config)
				.success(function (data, status, headers, config) {
				});
		}

		$scope.onChangeSelectedWeek = function () {
			var week_no = $scope.selected_week.week_no;
			var newSelect = $scope.weeks.find(function (elem) {
				return elem.week_no == week_no;
			});
			$scope.selected_week.start_at = newSelect.start_at;
			$scope.selected_week.close_at = newSelect.close_at;
			$scope.selected_week.validity = newSelect.validity;
		}
		$scope.onAddCredit = function () {
			var data = $.param({ credit: $scope.credittoadd });

			$http.post(Server_api_url + 'terminal/credit_add', data, UserInfo_service.http_config)
				.success(function (data, status, headers, config) {
					if (data.result == 1) {
						alert('Success');
					}
					else {
						alert(data.message);
					}
				});
		}
	});
