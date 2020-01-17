'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('betting')
  .controller('ResultsCtrl', function ($rootScope, $scope, $position, UserInfo_service, $interval, Server_api_url, $http) {

	UserInfo_service.checkUrl();

	$('#heading').text("Admin Results Dashboard");
	UserInfo_service.setHeading("Admin Results Dashboard");

	var data = $.param({ status: true });
	$http.post(Server_api_url + 'game/game_all', data, UserInfo_service.http_config)
	  .success(function (data, status, headers, config) {
		$scope.games = data.requests;
		setTimeout(function () {

		  $('#scoresTable').dataTable({
			"sScrollX": '99%',
		  });
		});

		$('#scoresTable').on('click', '.check', function (e) {
		  e.preventDefault();

		  var id = $(this).closest('tr').data('id');
		  var checkstatus = !($(this).hasClass('btn-success'));
		  var data = $.param({ _id: id, checked: checkstatus });
		  var checker = this;

		  $http.post(Server_api_url + 'game/game_edit', data, UserInfo_service.http_config)
			.success(function (data, status, headers, config) {
			  checker.outerHTML = '<a class="check btn btn-' + (data.game.checked ? 'success' : 'danger') + ' btn-circle" href="javascript:;"><i class="fa fa-' + (data.game.checked ? 'check' : 'times') + '"></i></a>';
			})

		});

	  })

	$scope.onDraw = function () {
	  var data = $.param({});
	  $http.post(Server_api_url + 'bet/bet_draw', data, UserInfo_service.http_config)
		.success(function (data, status, headers, config) {
		  if (data.result == 1) {
			alert("Successfully Drawed");
		  }
		  else
			alert(data.message);
		});
	}

  });
