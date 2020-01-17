'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('betting')
  .controller('GamesCtrl', function ($rootScope, $scope, $position, UserInfo_service, $interval, Server_api_url, $http) {

    UserInfo_service.checkUrl();

    $('#heading').text("Admin Games Dashboard");
    UserInfo_service.setHeading("Admin Games Dashboard");

    var counter;
    var flag = Array(50);
    var nEditing = null;

    flag.fill(false);

    var data = $.param({});
    $http.post(Server_api_url + 'game/game_all', data, UserInfo_service.http_config)
      .success(function (data, status, headers, config) {
        if (data.result == 1) {
          $scope.games = data.requests;
          counter = $scope.games.length;
          $scope.week_no = data.week_no;
          $scope.games.forEach(function (element) {
            flag[element.game_no] = true;
          }, this);
        }

        $scope.addGame = function () {
          if (nEditing !== null) {
            /* Currently editing - but not this row - restore the old before continuing to edit mode */
            $('#editConfirmModal').modal();
          }
          else {
            for (var i = 1; i < 50; i++)
              if (flag[i] == false)
                break;
            if (i == 50) {
              alert("Can't add any more");
              return;
            }
            var data = $.param({
              game_no: i,
              week_no: $scope.week_no,
              home_team: 'home' + counter,
              away_team: 'away' + counter,
            });

            $http.post(Server_api_url + 'game/game_add', data, UserInfo_service.http_config)
              .success(function (data, status, headers, config) {
                if (data.result == 1) {
                  var aiNew = oTable.fnAddData([
                    data.game.game_no,
                    data.game.home_team,
                    data.game.away_team,
                    data.game.week_no,
                    '<a class="edit" href="javascript:;">Edit</a>',
                    '<a class="delete" href="javascript:;">Delete</a>',
                  ]);

                  var nRow = oTable.fnGetNodes(aiNew[0]);
                  nRow.dataset["id"] = data.game._id;

                  nEditing = nRow;
                  counter++;
                  editRow(oTable, nRow);
                }
                else {
                  alert(data.message);
                }
              })
              .error(function (data, status, headers, config) {
              })
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
          jqTds[0].innerHTML = '<input type="number" min = 1 max = 49 class="form-control input-small" value="' + aData[0] + '">';
          jqTds[1].innerHTML = '<input type="text" class="form-control input-small" value="' + aData[1] + '">';
          jqTds[2].innerHTML = '<input type="text" class="form-control input-small" value="' + aData[2] + '">';
          jqTds[3].innerHTML = aData[3];
          jqTds[4].innerHTML = '<a class="edit" href="">Save</a>';
          jqTds[5].innerHTML = '<a class="cancel" href="">Cancel</a>';
          oTable.fnDraw();
        }

        function saveRow(oTable, nRow) {
          var jqInputs = $('input', nRow);

          var data = $.param({
            _id: nRow.dataset["id"],
            game_no: jqInputs[0].value,
            home_team: jqInputs[1].value,
            away_team: jqInputs[2].value,
            week_no: $scope.week_no,
          });

          $http.post(Server_api_url + 'game/game_edit', data, UserInfo_service.http_config)
            .success(function (data, status, headers, config) {
              if (data.result == 1) {
                oTable.fnUpdate(jqInputs[0].value, nRow, 0, false);
                oTable.fnUpdate(jqInputs[1].value, nRow, 1, false);
                oTable.fnUpdate(jqInputs[2].value, nRow, 2, false);
                oTable.fnUpdate('<a class="edit" href="">Edit</a>', nRow, 4, false);
                oTable.fnUpdate('<a class="delete" href="">Delete</a>', nRow, 5, false);
                nEditing = null;
                flag[jqInputs[0].value] = true;
                oTable.fnDraw();
              }
              else {
                alert(data.message);
              }
            })
            .error(function (data, status, headers, config) {
            })
        }

        function cancelEditRow(oTable, nRow) {
          var jqInputs = $('input', nRow);
          oTable.fnUpdate(jqInputs[0].value, nRow, 0, false);
          oTable.fnUpdate(jqInputs[1].value, nRow, 1, false);
          oTable.fnUpdate(jqInputs[2].value, nRow, 2, false);
          oTable.fnUpdate(jqInputs[3].value, nRow, 3, false);
          oTable.fnUpdate('<a class="edit" href="">Edit</a>', nRow, 4, false);
          oTable.fnDraw();
        }

        var table = $('#gameTable');
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


            // $('#delete_item').click(function () {
            //   var id = $('#deleteConfirmModal').data('id');
            //   $('[data-id=' + id + ']').remove();
            //   $('#deleteConfirmModal').modal('hide');
            // });


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

          $http.post(Server_api_url + 'game/game_delete', data, UserInfo_service.http_config)
            .success(function (data, status, headers, config) {
              if (data.result == 1) {
                flag[oTable.fnGetData($('[data-id=' + id + ']')[0], 0)] = false;
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
            // $('#saveConfirmModal').modal();
          } else {
            /* No edit in progress - let's start one */
            editRow(oTable, nRow);
            nEditing = nRow;
          }

        })
      })
      .error(function (data, status, headers, config) {
      })

  });
