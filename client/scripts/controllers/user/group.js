'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('betting')
  .controller('GroupGameCtrl', function ($rootScope, $scope, $position, UserInfo_service, $interval, $http, Server_api_url) {

    UserInfo_service.checkUrl();

    $('#heading').text("User Group Bet");
    UserInfo_service.setHeading("User Group Bet");

    var data = $.param({ status: true });
    $http.post(Server_api_url + 'game/game_all', data, UserInfo_service.http_config)
      .success(function (data, status, headers, config) {
        $scope.games = data.requests;
        function compare(a, b) {
          return a.game_no > b.game_no;
        }
        $scope.games.sort(compare);
        $scope.option = "";
      });

    var data = $.param({});

    $http.post(Server_api_url + 'setting/get_setting', data, UserInfo_service.http_config)
      .success(function (data, status, headers, config) {
        if (data.result == 1) {
          $scope.cur_week = data.cur_week;
        }
      });

    $scope.data = [];
    $scope.group = [];
    $scope.under = 3;
    $scope.option = "";
    $scope.group_1 = 1;
    $scope.group_2 = 1;
    $scope.group_3 = 1;
    $scope.group_4 = 1;
    $scope.group_5 = 1;
    $scope.group_6 = 1;

    $scope.currentgroup = "group1";

    for (var i = 1; i < 50; i++)
      $scope.data[i] = "";

    $scope.groupcnt = 1;

    $scope.togglebtn = function ($id) {
      if ($scope.data[$id] != $scope.currentgroup) {
        $('#fixture_' + $id).addClass($scope.currentgroup);
        $scope.data[$id] = $scope.currentgroup;
      }
      else {
        $('#fixture_' + $id).removeClass($scope.data[$id]);
        $scope.data[$id] = "";
      }

      // $scope.calculate();
    };

    $scope.onGroupSelect = function ($id) {
      $scope.currentgroup = 'group' + $id;
    }

    $scope.selectUnder = function ($under) {
      $scope.under = $under;
    }

    $scope.onChangeGroupValue = function ($id) {
      var cnt = 0;
      var under = $scope.under;

      for (var i = 1; i <= $scope.groupcnt; i++) {
        if ($id != i)
          cnt = cnt + Number($('#group_' + i).val());
      }

      if (under < cnt + Number($('#group_' + $id).val()))
        $('#group_' + $id).val(under - cnt);
    }

    $scope.calculate = function () {
      var i;
      var totalline = 0;
      var selectcnt;
      var stakeamt = $('#input_stakeamt').val();
      var apl = -1;

      for (i = 1; i <= 7; i++) {
        if ($scope.data[i] != "")
          selectcnt++;
      }

      for (i = 3; i <= 6; i++) {
        if ($scope.option[i] == "toggled" && selectcnt >= i) {
          var line = 1;
          for (var j = 1; j <= i; j++) {
            line = line * (n - j + 1) / j;
          }

          totalline += line;
        }
      }

      if (totalline > 0)
        apl = stakeamt / totalline;

      if (apl != -1)
        $('#label_apl').text('APL :NGN ' + apl);

    }
    $('#input_stakeamt').change(function () {
      $scope.calculate();
    });

    $scope.onGroupCntChange = function ($group) {
      var cnt = 0;
      var under = $scope.under;

      for (var i = 1; i <= $scope.groupcnt; i++) {
        if (i != $group)
          cnt = cnt + Number($('#group_' + i).val());
      }


      if (under - cnt < Number($('#group_' + $group).val())) {
        $('#group_' + $group).val(under - cnt);
      }
    }

    $('#addGroup').on('click', function () {
      if ($scope.groupcnt == 6)
        return;

      var cnt = 0;
      var under = $scope.under;

      for (var i = 1; i <= $scope.groupcnt; i++) {
        cnt = cnt + Number($('#group_' + i).val());
      }

      if (under <= cnt)
        return;

      $scope.groupcnt++;
      $('#divgroup_' + $scope.groupcnt).show();
      $('#group_' + $scope.groupcnt).val(1);
      $('#group' + i).click();
    });

    $('#removeGroup').on('click', function () {
      if ($scope.groupcnt == 1)
        return;

      $('#divgroup_' + $scope.groupcnt).hide();
      if ($scope.currentgroup == 'group' + $scope.groupcnt)
        $scope.currentgroup = "";
      $scope.groupcnt--;
    });

    $scope.selectOption = function (option) {
      $scope.option = option;
    }

    $scope.onStake = function () {

      // if (Date() > $scope.cur_week.close_at || Date() < $scope.cur_week.start_at) {
      //   alert("Wait comming week");
      //   return;
      // }

      if ($scope.option == "") {
        alert("Select Option First");
        return;
      }

      var gamelist = [];
      var under = $scope.under;
      var userEmail = UserInfo_service.getUserEmail();
      var betType = "Group";
      var stake_amount = $('#input_stakeamt').val();
      var option = $scope.option;

      var totalunder = 0;

      for (var i = 1; i <= $scope.groupcnt; i++) {
        var sublist = { under: Number($('#group_' + i).val()), list: [] };
        totalunder += sublist.under;
        for (var j = 1; j < 50; j++) {
          if ($scope.data[j] == ('group' + i))
            sublist.list.push(j);
        }
        gamelist.push(sublist);
      }

      if (totalunder != under) {
        alert("Select group nums correctly");
        return;
      }

      var data = $.param({
        player_id: userEmail,
        type: betType,
        under: under,
        gamelist: gamelist,
        stake_amount: stake_amount,
        option: $scope.option,
      });

      $http.post(Server_api_url + 'bet/bet_add', data, UserInfo_service.http_config)
        .success(function (data, status, headers, config) {
          if (data.result == 1) {
            alert("Success");
          }
          else {
            alert(data.message);
          }
        });
    }

  });
