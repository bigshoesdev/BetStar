'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('betting')
  .controller('AgentsCtrl', function ($http, $rootScope, $scope, $position, UserInfo_service, $interval, Server_api_url) {

	UserInfo_service.checkUrl();

	$('#heading').text("Staff Agents Dashboard");
	UserInfo_service.setHeading("Staff Agents Dashboard");

	var data = $.param({ user_role: 'staff' });

	$scope.staffData = [UserInfo_service.getUser()];

	var data = $.param({ user_role: 'agent', user_staff: UserInfo_service.getUser().user_id });
	$http.post(Server_api_url + 'user/user_all', data, UserInfo_service.http_config)
	  .success(function (agentdata, status, headers, config) {

		var filter = [];

		for (var i = 0; i < agentdata.users.length; i++) {
		  filter.push({ user_id: agentdata.users[i].user_id });
		}

		var data = $.param({ $or: filter, user_role: 'agent' });

		$http.post(Server_api_url + 'user/user_all', data, UserInfo_service.http_config)
		  .success(function (data, status, headers, config) {
			$scope.agentData = data.users;

			var counter = $scope.agentData.length;

			$scope.addAgent = function () {

			  if (nEditing !== null && nEditing != nRow) {
				/* Currently editing - but not this row - restore the old before continuing to edit mode */
				// $('#editConfirmModal').modal();
			  }
			  else {
				var aiNew = oTable.fnAddData([
				  '',
				  'agent' + counter,
				  'agent' + counter,
				  'agent' + counter,
				  'agent' + counter,
				  '',
				  'agent' + counter,
				  'agent' + counter,
				  'agent' + counter,
				  '<a class="edit" href="javascript:;">Edit</a>',
				  '<a class="delete" href="javascript:;">Delete</a>',
				]);

				var nRow = oTable.fnGetNodes(aiNew[0]);
				nRow.dataset["id"] = counter;

				nEditing = nRow;
				counter++;

				var data = $.param({
				  user_id: 'agent' + counter,
				  user_email: 'agent' + counter,
				  user_firstname: 'agent' + counter,
				  user_lastname: 'agent' + counter,
				  user_staff: 'agent' + counter,
				  user_phonenumber: 'agent' + counter,
				  user_address: 'agent' + counter,
				  user_role: 'agent',
				});

				$http.post(Server_api_url + 'user/user_edit', data, UserInfo_service.http_config)
				  .success(function (data, status, headers, config) {
					oTable.fnUpdate(data.user._id, nRow, 0, false);
					oTable.fnUpdate(data.user.user_createdat, nRow, 8, false);
					nRow.dataset["id"] = data.user._id;
					oTable.fnDraw();
					editRow(oTable, nRow);
				  })
				  .error(function (data, status, header, config) {
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
			  jqTds[0].innerHTML = aData[0];
			  jqTds[1].innerHTML = '<input type="text" class="form-control input-small" value="' + aData[1] + '">';
			  jqTds[2].innerHTML = '<input type="text" class="form-control input-small" value="' + aData[2] + '">';
			  jqTds[3].innerHTML = '<input type="text" class="form-control input-small" value="' + aData[3] + '">';
			  jqTds[4].innerHTML = '<input type="text" class="form-control input-small" value="' + aData[4] + '">';

			  var content = '<select class="form-control">';
			  var index = 0;

			  for (var i = 0; i < $scope.staffData.length; i++) {
				if (aData[5] == $scope.staffData[i].user_id)
				  index = i;
				content += '<option value="' + $scope.staffData[i]._id + '">' + $scope.staffData[i].user_id + '</option>';
			  }

			  content += '</select>';
			  jqTds[5].innerHTML = content;

			  jqTds[6].innerHTML = '<input type="text" class="form-control input-small" value="' + aData[6] + '">';
			  jqTds[7].innerHTML = '<input type="text" class="form-control input-small" value="' + aData[7] + '">';
			  jqTds[8].innerHTML = aData[8];
			  jqTds[9].innerHTML = '<a class="edit" href="">Save</a>';
			  jqTds[10].innerHTML = '<a class="cancel" href="">Cancel</a>';

			  oTable.fnDraw();
			  $('select')[0].selectedIndex = index;

			}

			function saveRow(oTable, nRow) {
			  var jqInputs = $('input', nRow);

			  var staff = $('select')[0].selectedOptions[0].innerText;
			  // oTable.fnUpdate(jqInputs[0].value, nRow, 0, false);
			  oTable.fnUpdate(jqInputs[0].value, nRow, 1, false);
			  oTable.fnUpdate(jqInputs[1].value, nRow, 2, false);
			  oTable.fnUpdate(jqInputs[2].value, nRow, 3, false);
			  oTable.fnUpdate(jqInputs[3].value, nRow, 4, false);
			  oTable.fnUpdate(staff, nRow, 5, false);
			  oTable.fnUpdate(jqInputs[4].value, nRow, 6, false);
			  oTable.fnUpdate(jqInputs[5].value, nRow, 7, false);
			  oTable.fnUpdate('<a class="edit" href="">Edit</a>', nRow, 9, false);
			  oTable.fnUpdate('<a class="delete" href="">Delete</a>', nRow, 10, false);

			  var aData = oTable.fnGetData(nRow);

			  var data = $.param({
				_id: aData[0],
				user_id: aData[1],
				user_email: aData[2],
				user_firstname: aData[3],
				user_lastname: aData[4],
				user_staff: staff,
				user_phonenumber: aData[6],
				user_address: aData[7],
			  });

			  $http.post(Server_api_url + 'user/user_edit', data, UserInfo_service.http_config)
				.success(function (data, status, headers, config) {
				  oTable.fnDraw();
				})
				.error(function (data, status, header, config) {
				});
			}

			function cancelEditRow(oTable, nRow) {
			  var jqInputs = $('input', nRow);
			  oTable.fnUpdate(jqInputs[0].value, nRow, 0, false);
			  oTable.fnUpdate(jqInputs[1].value, nRow, 1, false);
			  oTable.fnUpdate(jqInputs[2].value, nRow, 2, false);
			  oTable.fnUpdate(jqInputs[3].value, nRow, 3, false);
			  oTable.fnUpdate(jqInputs[4].value, nRow, 4, false);
			  oTable.fnUpdate(jqInputs[5].value, nRow, 5, false);
			  oTable.fnUpdate(jqInputs[6].value, nRow, 6, false);
			  oTable.fnUpdate('<a class="edit" href="">Edit</a>', nRow, 7, false);
			  oTable.fnDraw();
			}

			var table = $('#usersTable');
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
				var nRow = $(this).parents('tr')[0];
				$('#deleteConfirmModal').data('id', id).modal('show');


				$('#delete_item').click(function () {
				  var id = $('#deleteConfirmModal').data('id');

				  var data = $.param({
					_id: id,
				  });


				  $http.post(Server_api_url + 'user/user_delete', data, UserInfo_service.http_config)
					.success(function (data, status, headers, config) {
					  if (data.result == 1) {
						if ($('[data-id=' + id + ']')[0] != undefined)
						  oTable.fnDeleteRow($('[data-id=' + id + ']')[0]);
					  }
					})
					.error(function (data, status, header, config) {
					});
				});


				/*$('#deleteConfirmModal').modal({ backdrop: 'static', keyboard: false })
				 .one('click', '#delete_item', function (e) {
				 // var aiNew = oTable.fnAddData(['', '', '', '', '', '']);
				 var nRow = oTable.fnGetNodes();
				 console.log(nRow);
				 oTable.fnDeleteRow(nRow[0]);
		
				 });*/
			  }
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
		  })
		  .error(function (data, status, header, config) {
			alert('fail');
		  });
	  })

  });
