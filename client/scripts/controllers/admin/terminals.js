'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('betting')
	.controller('TerminalsCtrl', function ($rootScope, $scope, $position, UserInfo_service, $interval, $http, Server_api_url) {

		UserInfo_service.checkUrl();

		$('#heading').text("admin terminals dashboard");
		UserInfo_service.setHeading("admin terminals dashboard");

		var table = $('#terminalsTable');
		var oTable;

		var data = $.param({ user_role: 'agent' });
		var terminal_ids = [];

		$http.post(Server_api_url + 'user/user_all', data, UserInfo_service.http_config)
			.success(function (data, status, headers, config) {
				$scope.agents = data.users;

				var data = $.param({});
				var counter;
				$http.post(Server_api_url + 'terminal/terminal_all', data, UserInfo_service.http_config)
					.success(function (data, status, headers, config) {

						if (data.result == 1) {
							$scope.terminals = data.terminals;
							$scope.options = data.options;

							for (var i = 0; i < $scope.terminals.length; i++) {
								terminal_ids.push($scope.terminals[i]._id);
							}
							counter = $scope.terminals.length;
						}
						else
							counter = 1;

						setTimeout(function () {
							oTable = table.dataTable({
								"order": [
									[0, "desc"]
								],

								// set the initial value
								"sScrollX": '99%',
								dom: 'Bfrtip',
								buttons: [
									'copy', 'csv', 'excel', 'pdf', 'print'
								],
								iDisplayLength: 5,
							});
							oTable.fnSetColumnVis(0, false, true);
						});

						$scope.enableAll = function () {
							var data = $.param({});
							$http.post(Server_api_url + 'terminal/all_enable', data, UserInfo_service.http_config)
								.success(function (data, status, headers, config) {
									if (data.result == 1) {
										var btns = $('.btn_tmnsts');
										for (var i = 0; i < btns.length; i++) {
											$(btns[i]).removeClass('btn-danger');
											$(btns[i]).addClass('btn-success');
											btns[i].innerHTML = '<i class="fa fa-check"></i>';
										}
									}
								});
						}

						$scope.disableAll = function () {
							var data = $.param({});
							$http.post(Server_api_url + 'terminal/all_disable', data, UserInfo_service.http_config)
								.success(function (data, status, headers, config) {
									if (data.result == 1) {
										var btns = $('.btn_tmnsts');
										for (var i = 0; i < btns.length; i++) {
											$(btns[i]).removeClass('btn-success');
											$(btns[i]).addClass('btn-danger');
											btns[i].innerHTML = '<i class="fa fa-times"></i>';
										}
									}
								});
						}

						$scope.addTerminal = function () {

							if (nEditing !== null) {
								/* Currently editing - but not this row - restore the old before continuing to edit mode */
								$('#editConfirmModal').modal();
							}
							else {

								if ($scope.agents.length == 0) {
									alert('There is not any agent.');
									return;
								}
								var data = $.param({
									terminal_no: 'terminal' + Math.floor(Math.random() * 1000),
									agent_id: $scope.agents[0] == undefined ? '' : $scope.agents[0].user_id,
								});

								$http.post(Server_api_url + 'terminal/terminal_add', data, UserInfo_service.http_config)
									.success(function (data, status, headers, config) {

										if (data.result == 1) {

											terminal_ids.push(data.terminal._id);
											var divoption = '<div class="col" style="text-align:center;width:300px;">';

											for (var i = 0; i < data.terminal.options.length; i++) {
												divoption += '<div class="form-group" style="display:inline-flex;">';
												divoption += '<label style="width:50px;margin-top: 8px;">';
												divoption += data.terminal.options[i].name;
												divoption += ' : </label>';
												divoption += '<button data-id = "' + data.terminal._id + '" data-index = "' + i + '" type="button" class="btn_optsts btn btn-success btn-circle" style="margin:4px 8px 1px 0px;"><i class="fa fa-check"></i></button>';
												divoption += '<label style="margin-top: 8px;margin-right: 4px;">Commission :</label>';
												divoption += '<input type="number" id = "cms_' + data.terminal._id + '_' + i + '" min=1 max=100 style="margin-bottom: 5px;width: 70px;" class="form-control input-small" value="0">';
												divoption += '</div>';
											}
											divoption += '</div>';

											var divunder = '<div class="col" style="text-align:center;width:155px;">';
											divunder += '<div class="form-group" style="padding-bottom: 2px;width:120px;">';
											divunder += '<label style="width:70px">Status : </label>';
											divunder += '<button data-id = "' + data.terminal._id + '" type="button" class="btn_tmnsts btn btn-success btn-circle"><i class="fa fa-check"></i></button></div>';
											for (var i = 0; i < 4; i++) {
												divunder += '<div class="form-group" style="padding-bottom: 2px;width:120px;">';
												divunder += '<label style="width:70px">U' + (3 + i) + ' : </label>';
												divunder += '<button data-id = "' + data.terminal._id + '" data-index = "' + i + '" type="button" class="btn_undsts btn btn-success btn-circle"><i class="fa fa-check"></i></button></div>';
											}
											// '<div class="form-group" style="padding-bottom: 2px;width:85px;"><label style="width:30px">U4 : </label><button type="button" class="btn btn-success btn-circle"><i class="fa fa-check"></i></button></div><div class="form-group" style="padding-bottom: 2px;width:85px;"><label style="width:30px">U5 : </label><button type="button" class="btn btn-success btn-circle"><i class="fa fa-check"></i></button></div><div class="form-group" style="padding-bottom: 2px;width:85px;"><label style="width:30px">U6 : </label><button type="button" class="btn btn-success btn-circle"><i class="fa fa-check"></i></button></div></div>',

											var aiNew = oTable.fnAddData([
												data.terminal._id,
												data.terminal.terminal_no,
												data.terminal.agent_id,
												data.terminal.default_type,
												data.terminal.default_option,
												data.terminal.default_under,
												data.terminal.credit_limit,
												data.terminal.max_stake,
												data.terminal.min_stake,
												divoption,
												divunder,
												'<a class="edit" href="javascript:;">Edit</a>',
												'<a class="delete" href="javascript:;">Delete</a>',
											]);

											var nRow = oTable.fnGetNodes(aiNew[0]);
											nRow.dataset["id"] = data.terminal._id;
											nRow.childNodes[9].style = "text-align:center; width:300px;";
											nRow.childNodes[10].style = "text-align:center; width:360px";

											nEditing = nRow;
											counter++;
											editRow(oTable, nRow);
										}
										else {
											alert(data.message);
										}

									});
							}

						}

						function restoreRow(oTable, nRow) {
							var aData = oTable.fnGetData(nRow);
							var jqTds = $('>td', nRow);

							for (var i = 0, iLen = jqTds.length; i < iLen; i++) {
								if (i != 9 && i != 10)
									oTable.fnUpdate(aData[i], nRow, i, false);
							}

							oTable.fnDraw();
						}

						function editRow(oTable, nRow) {
							var aData = oTable.fnGetData(nRow);
							var jqTds = $('>td', nRow);
							jqTds[0].innerHTML = '<input type="text" class="form-control input-small" value="' + aData[1] + '">';

							var content = '<select class="form-control">';
							var index = 0;

							for (var i = 0; i < $scope.agents.length; i++) {
								if (aData[2] == $scope.agents[i].user_id)
									index = i;
								content += '<option value="' + $scope.agents[i]._id + '">' + $scope.agents[i].user_id + '</option>';
							}

							content += '</select>';

							jqTds[1].innerHTML = content;

							var content = '<select class="form-control">';
							var index = 0;
							var datas = ["Nap/Perm", "Group"];

							for (var i = 0; i < datas.length; i++) {
								if (aData[3] == datas[i])
									index = i;
								content += '<option value="' + i + '">' + datas[i] + '</option>';
							}

							content += '</select>';
							jqTds[2].innerHTML = content;

							var content = '<select class="form-control">';
							var index = 0;

							for (var i = 0; i < $scope.options.length; i++) {
								if (aData[4] == $scope.options[i].name)
									index = i;
								content += '<option value="' + i + '">' + $scope.options[i].name + '</option>';
							}

							content += '</select>';
							jqTds[3].innerHTML = content;

							var content = '<select class="form-control">';
							var index = 0;
							var datas = ["U3", "U4", "U5", "U6"];

							for (var i = 0; i < 4; i++) {
								if (aData[5] == datas[i])
									index = i;
								content += '<option value="' + i + '">' + datas[i] + '</option>';
							}

							content += '</select>';
							jqTds[4].innerHTML = content;
							jqTds[5].innerHTML = '<input type="text" class="form-control input-small" value="' + aData[6] + '">';
							jqTds[6].innerHTML = '<input type="text" class="form-control input-small" value="' + aData[7] + '">';
							jqTds[7].innerHTML = '<input type="text" class="form-control input-small" value="' + aData[8] + '">';
							// jqTds[9].innerHTML = aData[9];
							// jqTds[10].innerHTML = aData[10];
							jqTds[10].innerHTML = '<a class="edit" href="">Save</a>';
							jqTds[11].innerHTML = '<a class="cancel" href="">Cancel</a>';
							oTable.fnDraw();
						}

						function saveRow(oTable, nRow) {
							var jqInputs = $('input', nRow);
							var aData = oTable.fnGetData(nRow);

							// oTable.fnUpdate(jqInputs[0].value, nRow, 0, false);
							// var agent_id = $('select')[0].selectedOptions[0].innerText;

							var data = $.param({
								_id: aData[0],
								terminal_no: jqInputs[0].value,
								agent_id: $('select')[0].selectedOptions[0].innerText,
								default_type: $('select')[1].selectedOptions[0].innerText,
								default_option: $('select')[2].selectedOptions[0].innerText,
								default_under: $('select')[3].selectedOptions[0].innerText,
								credit_limit: jqInputs[1].value,
								max_stake: jqInputs[2].value,
								min_stake: jqInputs[3].value,
							});

							$http.post(Server_api_url + 'terminal/terminal_edit', data, UserInfo_service.http_config)
								.success(function (data, status, headers, config) {
									if (data.result == 1) {
										oTable.fnUpdate(jqInputs[0].value, nRow, 1, false);
										oTable.fnUpdate($('select')[0].selectedOptions[0].innerText, nRow, 2, false);
										oTable.fnUpdate($('select')[0].selectedOptions[0].innerText, nRow, 3, false);
										oTable.fnUpdate($('select')[0].selectedOptions[0].innerText, nRow, 4, false);
										oTable.fnUpdate($('select')[0].selectedOptions[0].innerText, nRow, 5, false);
										oTable.fnUpdate(jqInputs[1].value, nRow, 6, false);
										oTable.fnUpdate(jqInputs[2].value, nRow, 7, false);
										oTable.fnUpdate(jqInputs[3].value, nRow, 8, false);
										oTable.fnUpdate('<a class="edit" href="">Edit</a>', nRow, 11, false);
										oTable.fnUpdate('<a class="delete" href="">Delete</a>', nRow, 12, false);
										nEditing = null;
										oTable.fnDraw();
									}
									else {
										alert(data.message);
									}

								});
						}

						function cancelEditRow(oTable, nRow) {
							var jqInputs = $('input', nRow);
							oTable.fnUpdate(jqInputs[1].value, nRow, 1, false);
							oTable.fnUpdate(jqInputs[2].value, nRow, 2, false);
							oTable.fnUpdate(jqInputs[3].value, nRow, 3, false);
							oTable.fnUpdate(jqInputs[4].value, nRow, 4, false);
							oTable.fnUpdate(jqInputs[5].value, nRow, 5, false);
							oTable.fnUpdate(jqInputs[6].value, nRow, 6, false);
							oTable.fnUpdate('<a class="edit" href="">Edit</a>', nRow, 7, false);
							oTable.fnUpdate('<a class="delete" href="">Delete</a>', nRow, 8, false);
							oTable.fnDraw();
						}

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
								/*if (confirm("Are you sure to delete this row ?") == false) {
								 return;
								 }*/

								/* $('button.btnDelete').on('click', function (e) {
								 e.preventDefault();
								 var id = $(this).closest('tr').data('id');
								 $('#myModal').data('id', id).modal('show');
								 });
						 
								 $('#btnDelteYes').click(function () {
								 var id = $('#myModal').data('id');
								 $('[data-id=' + id + ']').remove();
								 $('#myModal').modal('hide');
								 });*/

								var id = $(this).closest('tr').data('id');
								$('#deleteConfirmModal').data('id', id).modal('show');

								/*$('#deleteConfirmModal').modal({ backdrop: 'static', keyboard: false })
								 .one('click', '#delete_item', function (e) {
								 // var aiNew = oTable.fnAddData(['', '', '', '', '', '']);
								 var nRow = oTable.fnGetNodes();
								 console.log(nRow);
								 oTable.fnDeleteRow(nRow[0]);
						 
								 });*/
							}
						});

						$('#delete_item').click(function () {
							var id = $('#deleteConfirmModal').data('id');

							var data = $.param({ _id: id });

							$http.post(Server_api_url + 'terminal/terminal_delete', data, UserInfo_service.http_config)
								.success(function (data, status, headers, config) {
									if (data.result == 1) {
										oTable.fnDeleteRow($('[data-id=' + id + ']')[0]);

										terminal_ids.splice(terminal_ids.indexOf(id), 1);
									}
									else {
										alert(data.message);
									}
								});
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
								// $('#saveConfirmModal').modal();
							} else {
								/* No edit in progress - let's start one */
								editRow(oTable, nRow);
								nEditing = nRow;
							}
						});

						// table.on('click', '.btn_optsts', function (e) {
						//   e.preventDefault();
						//   alert (this.dataset['id']);
						// });

						$scope.save_commission = function () {
							var data = $.param({});
							$http.post(Server_api_url + 'terminal/terminal_all', data, UserInfo_service.http_config)
								.success(function (data, status, headers, config) {
									if (data.result == 1) {
										var terminals = data.terminals;
										var datasend = [];
										for (var i = 0; i < terminals.length; i++) {
											for (var j = 0; j < terminals[i].options.length; j++) {
												if (terminals[i].options[j].current) {
													terminals[i].options[j].commission = $('#cms_' + terminals[i]._id + '_' + j).val();
												}
											}
											datasend.push({ _id: terminals[i]._id, options: terminals[i].options });
										}

										var data = $.param({ data: datasend });
										$http.post(Server_api_url + 'terminal/save_commission', data, UserInfo_service.http_config)
											.success(function (data, status, headers, config) {
											});
									}
								});
						};

						table.on('click', '.btn_tmnsts', function (e) {
							e.preventDefault();
							var btn = this;
							var id = this.dataset['id'];
							var newstatus = $(btn).hasClass('btn-danger');

							var data = $.param({
								_id: id,
								status: newstatus,
							});

							$http.post(Server_api_url + 'terminal/terminal_edit', data, UserInfo_service.http_config)
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
						});

						// $scope.onChangeOptionStatus = function (id, num) {
						table.on('click', '.btn_optsts', function (e) {
							e.preventDefault();
							var btn = this;
							var id = this.dataset['id'];
							var num = this.dataset['index'];
							var newstatus = $(btn).hasClass('btn-danger');

							var data = $.param({
								_id: id,
							});

							$http.post(Server_api_url + 'terminal/terminal_all', data, UserInfo_service.http_config)
								.success(function (data, status, headers, config) {
									if (data.terminals.length == 1) {
										data.terminals[0].options[num].status = newstatus;
										var data = $.param({
											_id: id,
											options: data.terminals[0].options,
										});

										$http.post(Server_api_url + 'terminal/terminal_edit', data, UserInfo_service.http_config)
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
									}
								});
						});

						table.on('click', '.btn_undsts', function (e) {
							e.preventDefault();
							var btn = this;
							var id = this.dataset['id'];
							var num = this.dataset['index'];
							var newstatus = $(btn).hasClass('btn-danger');

							var data = $.param({
								_id: id,
							});

							$http.post(Server_api_url + 'terminal/terminal_all', data, UserInfo_service.http_config)
								.success(function (data, status, headers, config) {
									if (data.terminals.length == 1) {
										data.terminals[0].unders[num] = newstatus;
										var data = $.param({
											_id: id,
											unders: data.terminals[0].unders,
										});

										$http.post(Server_api_url + 'terminal/terminal_edit', data, UserInfo_service.http_config)
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
									}
								});
						});
					})
			});
	});
