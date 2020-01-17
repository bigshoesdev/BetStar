'use strict';
/**
 * @ngdoc overview
 * @name sbstaffApp
 * @description
 * # sbAdminApp
 *
 * Main module of the application.
 */
angular
	.module('betting', [
		'betting.config',
		'oc.lazyLoad',
		'ui.router',
		'ui.bootstrap',
		'angular-loading-bar',
		'ngRoute',
		'LocalStorageModule',
	])
	.config(['$stateProvider', '$urlRouterProvider', '$ocLazyLoadProvider', function ($stateProvider, $urlRouterProvider, $ocLazyLoadProvider) {

		$ocLazyLoadProvider.config({
			debug: false,
			events: true,
		});

		$urlRouterProvider.otherwise('/login');

		$stateProvider
			.state('login', {
				templateUrl: 'views/pages/login.html',
				controller: 'LoginCtrl',
				url: '/login',
				resolve: {
					loadMyFiles: function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'betting',
							files: [
								'scripts/services/userinfo.js',
								'plugins/bootstrapvalidator/js/bootstrapValidator.min.js',
								'scripts/controllers/auth/login.js',
							]
						})
					}
				}
			})
			.state('register', {
				templateUrl: 'views/pages/register.html',
				controller: 'RegisterCtrl',
				url: '/register',
				resolve: {
					loadMyFiles: function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'betting',
							files: [
								'scripts/services/userinfo.js',
								'plugins/bootstrapvalidator/js/bootstrapValidator.min.js',
								'scripts/controllers/auth/register.js',
							]
						})
					}
				}
			})
			.state('forgot', {
				templateUrl: 'views/pages/forgot.html',
				controller: 'ForgotCtrl',
				url: '/forgot',
				resolve: {
					loadMyFiles: function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'betting',
							files: [
								'scripts/services/userinfo.js',
								'scripts/controllers/auth/forgot.js',
							]
						})
					}
				}
			})

			.state('bet', {
				url: '/bet',
				templateUrl: 'views/admin/main.html',
				resolve: {
					loadMyDirectives: function ($ocLazyLoad) {
						return $ocLazyLoad.load(
							{
								name: 'betting',
								files: [
									'scripts/services/userinfo.js',
									'scripts/directives/sidebar/sidebar-search/sidebar-search.js',
									'scripts/directives/sidebar/sidebar.js',
									'scripts/directives/header/header-notification/header-notification.js',
									'scripts/directives/header/header.js',
								]
							}),
							$ocLazyLoad.load(
								{
									name: 'toggle-switch',
									files: ["bower_components/angular-toggle-switch/angular-toggle-switch.min.js",
										"bower_components/angular-toggle-switch/angular-toggle-switch.css"
									]
								}),
							$ocLazyLoad.load(
								{
									name: 'ngAnimate',
									files: ['bower_components/angular-animate/angular-animate.js']
								})
						$ocLazyLoad.load(
							{
								name: 'ngCookies',
								files: ['bower_components/angular-cookies/angular-cookies.js']
							})
						$ocLazyLoad.load(
							{
								name: 'ngResource',
								files: ['bower_components/angular-resource/angular-resource.js']
							})
						$ocLazyLoad.load(
							{
								name: 'ngSanitize',
								files: ['bower_components/angular-sanitize/angular-sanitize.js']
							})
						$ocLazyLoad.load(
							{
								name: 'ngTouch',
								files: ['bower_components/angular-touch/angular-touch.js']
							})
					}
				}
			})
			.state('bet.admin_dashboard', {
				url: '/admin/dashboard',
				templateUrl: 'views/admin/dashboard.html',
				controller: 'DashboardCtrl',
				resolve: {
					loadMyFiles: function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'betting',
							files: [
								'scripts/services/userinfo.js',
								'scripts/directives/stats/stats.js',
								'scripts/controllers/admin/dashboard.js',
							]
						})
					}
				}
			})
			.state('bet.admin_bets', {
				url: '/admin/bets',
				templateUrl: 'views/admin/bets/bets.html',
				controller: 'BetsCtrl',
				resolve: {
					loadMyFiles: function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'betting',
							files: [
								'scripts/services/userinfo.js',
								'scripts/directives/summary/summary.js',
								'scripts/controllers/admin/bets/bets.js',
							]
						})
					}
				}
			})
			.state('bet.admin_test', {
				url: '/admin/test',
				templateUrl: 'views/admin/test/test.html',
				controller: 'TestCtrl',
				resolve: {
					loadMyFiles: function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'betting',
							files: [
								'scripts/services/userinfo.js',
								'scripts/directives/summary/summary.js',
								'scripts/controllers/admin/test/test.js',
							]
						})
					}
				}
			})
			.state('bet.admin_voidbet', {
				url: '/admin/void_bets',
				templateUrl: 'views/admin/bets/void_bets.html',
				controller: 'VoidBetsCtrl',
				resolve: {
					loadMyFiles: function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'betting',
							files: [
								'scripts/services/userinfo.js',
								'scripts/directives/summary/summary.js',
								'scripts/controllers/admin/bets/void_bets.js',
							]
						})
					}
				}
			})
			.state('bet.admin_staffsales', {
				url: '/admin/staffsales',
				templateUrl: 'views/admin/bets/staffsales.html',
				controller: 'StaffSaleCtrl',
				resolve: {
					loadMyFiles: function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'betting',
							files: [
								'scripts/services/userinfo.js',
								'scripts/directives/summary/summary.js',
								'scripts/controllers/admin/bets/staffsales.js',
							]
						})
					}
				}
			})
			.state('bet.admin_agentsales', {
				url: '/admin/agentsales',
				templateUrl: 'views/admin/bets/agentsales.html',
				controller: 'AgentSaleCtrl',
				resolve: {
					loadMyFiles: function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'betting',
							files: [
								'scripts/services/userinfo.js',
								'scripts/directives/summary/summary.js',
								'scripts/controllers/admin/bets/agentsales.js',
							]
						})
					}
				}
			})
			.state('bet.admin_terminalsales', {
				url: '/admin/ternimalsales',
				templateUrl: 'views/admin/bets/terminalsales.html',
				controller: 'TerminalSaleCtrl',
				resolve: {
					loadMyFiles: function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'betting',
							files: [
								'scripts/services/userinfo.js',
								'scripts/directives/summary/summary.js',
								'scripts/controllers/admin/bets/terminalsales.js',
							]
						})
					}
				}
			})
			.state('bet.admin_users', {
				url: '/admin/users',
				templateUrl: 'views/admin/users/users.html',
				controller: 'UsersCtrl',
				resolve: {
					loadMyFiles: function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'betting',
							files: [
								'scripts/services/userinfo.js',
								'scripts/controllers/admin/users/users.js',
							]
						})
					}
				}
			})
			.state('bet.admin_agents', {
				url: '/admin/agents',
				templateUrl: 'views/admin/users/agents.html',
				controller: 'AgentsCtrl',
				resolve: {
					loadMyFiles: function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'betting',
							files: [
								'scripts/services/userinfo.js',
								'scripts/controllers/admin/users/agents.js',
							]
						})
					}
				}
			})
			.state('bet.admin_staffs', {
				url: '/admin/staffs',
				templateUrl: 'views/admin/users/staffs.html',
				controller: 'StaffsCtrl',
				resolve: {
					loadMyFiles: function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'betting',
							files: [
								'scripts/services/userinfo.js',
								'scripts/controllers/admin/users/staffs.js',
							]
						})
					}
				}
			})
			.state('bet.admin_players', {
				url: '/admin/players',
				templateUrl: 'views/admin/users/players.html',
				controller: 'PlayersCtrl',
				resolve: {
					loadMyFiles: function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'betting',
							files: [
								'scripts/services/userinfo.js',
								'scripts/controllers/admin/users/players.js',
							]
						})
					}
				}
			})
			.state('bet.admin_terminals', {
				url: '/admin/terminals',
				templateUrl: 'views/admin/terminals.html',
				controller: 'TerminalsCtrl',
				resolve: {
					loadMyFiles: function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'betting',
							files: [
								'scripts/services/userinfo.js',
								'scripts/controllers/admin/terminals.js',
							]
						})
					}
				}
			})
			.state('bet.admin_diagram', {
				url: '/admin/diagram',
				templateUrl: 'views/admin/diagram.html',
				controller: 'DiagramCtrl',
				resolve: {
					loadMyFiles: function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'betting',
							files: [
								'scripts/services/userinfo.js',
								'scripts/controllers/admin/diagram.js',
							]
						})
					}
				}
			})
			.state('bet.admin_results', {
				url: '/admin/results',
				templateUrl: 'views/admin/results.html',
				controller: 'ResultsCtrl',
				resolve: {
					loadMyFiles: function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'betting',
							files: [
								'scripts/services/userinfo.js',
								'scripts/controllers/admin/results.js',
							]
						})
					}
				}
			})
			.state('bet.admin_prizevalue', {
				url: '/admin/prize_value',
				templateUrl: 'views/admin/prize_value.html',
				controller: 'PrizeValueCtrl',
				resolve: {
					loadMyFiles: function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'betting',
							files: [
								'scripts/services/userinfo.js',
								'scripts/controllers/admin/prize_value.js',
							]
						})
					}
				}
			})
			.state('bet.admin_games', {
				url: '/admin/games',
				templateUrl: 'views/admin/games/games.html',
				controller: 'GamesCtrl',
				resolve: {
					loadMyFiles: function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'betting',
							files: [
								'scripts/services/userinfo.js',
								'scripts/controllers/admin/games/games.js',
							]
						})
					}
				}
			})
			.state('bet.admin_scores', {
				url: '/admin/scores',
				templateUrl: 'views/admin/games/scores.html',
				controller: 'ScoresCtrl',
				resolve: {
					loadMyFiles: function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'betting',
							files: [
								'scripts/services/userinfo.js',
								'scripts/controllers/admin/games/scores.js',
							]
						})
					}
				}
			})
			.state('bet.admin_wallet', {
				url: '/admin/wallet',
				templateUrl: 'views/admin/wallet/wallet.html',
				controller: 'WalletCtrl',
				resolve: {
					loadMyFiles: function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'betting',
							files: [
								'scripts/services/userinfo.js',
								'scripts/controllers/admin/wallet/wallet.js',
							]
						})
					}
				}
			})
			.state('bet.admin_request', {
				url: '/admin/request',
				templateUrl: 'views/admin/wallet/request.html',
				controller: 'RequestCtrl',
				resolve: {
					loadMyFiles: function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'betting',
							files: [
								'scripts/services/userinfo.js',
								'scripts/controllers/admin/wallet/request.js',
							]
						})
					}
				}
			})
			.state('bet.admin_betresults', {
				url: '/admin/betresults',
				templateUrl: 'views/admin/bets/betresults.html',
				controller: 'BetResultsCtrl',
				resolve: {
					loadMyFiles: function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'betting',
							files: [
								'scripts/services/userinfo.js',
								'scripts/directives/summary/summary.js',
								'scripts/controllers/admin/bets/betresults.js',
							]
						})
					}
				}
			})
			.state('bet.admin_winnerlist', {
				url: '/admin/winnerlist',
				templateUrl: 'views/admin/bets/winnerlist.html',
				controller: 'WinnerListCtrl',
				resolve: {
					loadMyFiles: function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'betting',
							files: [
								'scripts/services/userinfo.js',
								'scripts/directives/summary/summary.js',
								'scripts/controllers/admin/bets/winnerlist.js',
							]
						})
					}
				}
			})
			.state('bet.admin_deletebet', {
				url: '/admin/deletebet',
				templateUrl: 'views/admin/bets/deleterequest.html',
				controller: 'DeleteRequestCtrl',
				resolve: {
					loadMyFiles: function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'betting',
							files: [
								'scripts/services/userinfo.js',
								'scripts/directives/deleterequest/deleterequest.js',
								'scripts/controllers/admin/bets/deleterequest.js',
							]
						})
					}
				}
			})
			.state('bet.admin_settings', {
				url: '/admin/settings',
				templateUrl: 'views/admin/settings.html',
				controller: 'SettingsCtrl',
				resolve: {
					loadMyFiles: function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'betting',
							files: [
								'scripts/services/userinfo.js',
								'scripts/controllers/admin/settings.js',
							]
						})
					}
				}
			})
			.state('bet.admin_userdata', {
				url: '/admin/userdata',
				templateUrl: 'views/admin/userdata.html',
				controller: 'AdminUserDataCtrl',
				resolve: {
					loadMyFiles: function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'betting',
							files: [
								'scripts/services/userinfo.js',
								'scripts/controllers/admin/userdata.js',
							]
						})
					}
				}
			})

			.state('bet.agent_dashboard', {
				url: '/agent/dashboard',

				templateUrl: 'views/agent/dashboard.html',
				controller: 'DashboardCtrl',
				resolve: {
					loadMyFiles: function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'betting',
							files: [
								'scripts/services/userinfo.js',
								'scripts/directives/summary/summary.js',
								'scripts/controllers/agent/dashboard.js',
							]
						})
					}
				}
			})
			.state('bet.agent_sales', {
				url: '/agent/sales',
				templateUrl: 'views/agent/sales.html',
				controller: 'SalesCtrl',
				resolve: {
					loadMyFiles: function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'betting',
							files: [
								'scripts/services/userinfo.js',
								'scripts/directives/summary/summary.js',
								'scripts/controllers/agent/sales.js',
							]
						})
					}
				}
			})
			.state('bet.agent_bets', {
				url: '/agent/bets',
				templateUrl: 'views/agent/bets.html',
				controller: 'BetsCtrl',
				resolve: {
					loadMyFiles: function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'betting',
							files: [
								'scripts/services/userinfo.js',
								'scripts/directives/summary/summary.js',
								'scripts/controllers/agent/bets.js',
							]
						})
					}
				}
			})
			.state('bet.agent_resultsummary', {
				url: '/agent/resultsummary',
				templateUrl: 'views/agent/resultsummary.html',
				controller: 'ResultSummaryCtrl',
				resolve: {
					loadMyFiles: function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'betting',
							files: [
								'scripts/services/userinfo.js',
								'scripts/directives/summary/summary.js',
								'scripts/controllers/agent/resultsummary.js',
							]
						})
					}
				}
			})
			.state('bet.agent_deleterequest', {
				url: '/agent/deleterequest',
				templateUrl: 'views/agent/deleterequest.html',
				controller: 'AgentDeleteRequestCtrl',
				resolve: {
					loadMyFiles: function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'betting',
							files: [
								'scripts/services/userinfo.js',
								'scripts/directives/deleterequest/deleterequest.js',
								'scripts/controllers/agent/deleterequest.js',
							]
						})
					}
				}
			})
			.state('bet.agent_winnerlist', {
				url: '/agent/winnerlist',
				templateUrl: 'views/agent/winnerlist.html',
				controller: 'WinnerListCtrl',
				resolve: {
					loadMyFiles: function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'betting',
							files: [
								'scripts/services/userinfo.js',
								'scripts/directives/summary/summary.js',
								'scripts/controllers/agent/winnerlist.js',
							]
						})
					}
				}
			})
			.state('bet.agent_terminalsales', {
				url: '/agent/terminalsales',
				templateUrl: 'views/agent/terminalsales.html',
				controller: 'TerminalSalesCtrl',
				resolve: {
					loadMyFiles: function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'betting',
							files: [
								'scripts/services/userinfo.js',
								'scripts/directives/summary/summary.js',
								'scripts/controllers/agent/terminalsales.js',
							]
						})
					}
				}
			})
			.state('bet.agent_userdata', {
				url: '/agent/userdata',
				templateUrl: 'views/agent/userdata.html',
				controller: 'AgentUserDataCtrl',
				resolve: {
					loadMyFiles: function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'betting',
							files: [
								'scripts/services/userinfo.js',
								'scripts/controllers/agent/userdata.js',
							]
						})
					}
				}
			})

			// .state('bet.user_dashboard', {
			// 	url: '/user/dashboard',
			// 	templateUrl: 'views/user/dashboard.html',
			// 	controller: 'DashboardCtrl',
			// 	resolve: {
			// 		loadMyFiles: function ($ocLazyLoad) {
			// 			return $ocLazyLoad.load({
			// 				name: 'betting',
			// 				files: [
			// 					'scripts/services/userinfo.js',
			// 					'scripts/directives/stats/stats.js',
			// 					'scripts/controllers/user/dashboard.js',
			// 				]
			// 			})
			// 		}
			// 	}
			// })
			.state('bet.user_fund', {
				url: '/user/fund',
				templateUrl: 'views/user/fund.html',
				controller: 'FundCtrl',
				resolve: {
					loadMyFiles: function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'betting',
							files: [
								'scripts/services/userinfo.js',
								'scripts/controllers/user/fund.js',
							]
						})
					}
				}
			})
			.state('bet.user_group', {
				url: '/user/group',
				templateUrl: 'views/user/group.html',
				controller: 'GroupGameCtrl',
				resolve: {
					loadMyFiles: function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'betting',
							files: [
								'views/user/placebet.css',
								'scripts/services/userinfo.js',
								'scripts/controllers/user/group.js',
							]
						})
					}
				}
			})
			.state('bet.user_dashboard', {
				url: '/user/naperm',
				templateUrl: 'views/user/naperm.html',
				controller: 'NapermGameCtrl',
				resolve: {
					loadMyFiles: function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'betting',
							files: [
								'views/user/placebet.css',
								'scripts/services/userinfo.js',
								'scripts/controllers/user/naperm.js',
							]
						})
					}
				}
			})
			.state('bet.user_bethistory', {
				url: '/user/bethistory',
				templateUrl: 'views/user/bethistory.html',
				controller: 'BetHistoryCtrl',
				resolve: {
					loadMyFiles: function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'betting',
							files: [
								'scripts/services/userinfo.js',
								'scripts/directives/summary/summary.js',
								'scripts/controllers/user/bethistory.js',
							]
						})
					}
				}
			})
			.state('bet.user_betresult', {
				url: '/user/betresult',
				templateUrl: 'views/user/betresult.html',
				controller: 'BetResultCtrl',
				resolve: {
					loadMyFiles: function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'betting',
							files: [
								'scripts/services/userinfo.js',
								'scripts/controllers/user/betresult.js',
							]
						})
					}
				}
			})
			.state('bet.user_userdata', {
				url: '/user/userdata',
				templateUrl: 'views/user/userdata.html',
				controller: 'UserDataCtrl',
				resolve: {
					loadMyFiles: function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'betting',
							files: [
								'scripts/services/userinfo.js',
								'scripts/controllers/user/userdata.js',
							]
						})
					}
				}
			})
			.state('bet.staff_dashboard', {
				url: '/staff/dashboard',
				templateUrl: 'views/staff/dashboard.html',
				controller: 'DashboardCtrl',
				resolve: {
					loadMyFiles: function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'betting',
							files: [
								'scripts/services/userinfo.js',
								'scripts/directives/stats/stats.js',
								'scripts/controllers/staff/dashboard.js',
							]
						})
					}
				}
			})
			.state('bet.staff_bets', {
				url: '/staff/bets',
				templateUrl: 'views/staff/bets/bets.html',
				controller: 'BetsCtrl',
				resolve: {
					loadMyFiles: function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'betting',
							files: [
								'scripts/services/userinfo.js',
								'scripts/directives/summary/summary.js',
								'scripts/controllers/staff/bets/bets.js',
							]
						})
					}
				}
			})
			.state('bet.staff_voidbet', {
				url: '/staff/void_bets',
				templateUrl: 'views/staff/bets/void_bets.html',
				controller: 'VoidBetsCtrl',
				resolve: {
					loadMyFiles: function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'betting',
							files: [
								'scripts/services/userinfo.js',
								'scripts/directives/summary/summary.js',
								'scripts/controllers/staff/bets/void_bets.js',
							]
						})
					}
				}
			})
			.state('bet.staff_agentsales', {
				url: '/staff/agentsales',
				templateUrl: 'views/staff/bets/agentsales.html',
				controller: 'AgentSaleCtrl',
				resolve: {
					loadMyFiles: function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'betting',
							files: [
								'scripts/services/userinfo.js',
								'scripts/directives/summary/summary.js',
								'scripts/controllers/staff/bets/agentsales.js',
							]
						})
					}
				}
			})
			.state('bet.staff_terminalsales', {
				url: '/staff/ternimalsales',
				templateUrl: 'views/staff/bets/terminalsales.html',
				controller: 'TerminalSaleCtrl',
				resolve: {
					loadMyFiles: function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'betting',
							files: [
								'scripts/services/userinfo.js',
								'scripts/directives/summary/summary.js',
								'scripts/controllers/staff/bets/terminalsales.js',
							]
						})
					}
				}
			})
			.state('bet.staff_agents', {
				url: '/staff/agents',
				templateUrl: 'views/staff/users/agents.html',
				controller: 'AgentsCtrl',
				resolve: {
					loadMyFiles: function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'betting',
							files: [
								'scripts/services/userinfo.js',
								'scripts/controllers/staff/users/agents.js',
							]
						})
					}
				}
			})
			.state('bet.staff_terminals', {
				url: '/staff/terminals',
				templateUrl: 'views/staff/terminals.html',
				controller: 'TerminalsCtrl',
				resolve: {
					loadMyFiles: function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'betting',
							files: [
								'scripts/services/userinfo.js',
								'scripts/controllers/staff/terminals.js',
							]
						})
					}
				}
			})
			.state('bet.staff_betresults', {
				url: '/staff/betresults',
				templateUrl: 'views/staff/bets/betresults.html',
				controller: 'BetResultsCtrl',
				resolve: {
					loadMyFiles: function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'betting',
							files: [
								'scripts/services/userinfo.js',
								'scripts/directives/summary/summary.js',
								'scripts/controllers/staff/bets/betresults.js',
							]
						})
					}
				}
			})
			.state('bet.staff_winnerlist', {
				url: '/staff/winnerlist',
				templateUrl: 'views/staff/bets/winnerlist.html',
				controller: 'WinnerListCtrl',
				resolve: {
					loadMyFiles: function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'betting',
							files: [
								'scripts/services/userinfo.js',
								'scripts/directives/summary/summary.js',
								'scripts/controllers/staff/bets/winnerlist.js',
							]
						})
					}
				}
			})
			.state('bet.staff_deletebet', {
				url: '/staff/deletebet',
				templateUrl: 'views/staff/bets/deleterequest.html',
				controller: 'DeleteRequestCtrl',
				resolve: {
					loadMyFiles: function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'betting',
							files: [
								'scripts/services/userinfo.js',
								'scripts/directives/deleterequest/deleterequest.js',
								'scripts/controllers/staff/bets/deleterequest.js',
							]
						})
					}
				}
			})
			.state('bet.staff_userdata', {
				url: '/staff/userdata',
				templateUrl: 'views/staff/userdata.html',
				controller: 'StaffUserDataCtrl',
				resolve: {
					loadMyFiles: function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'betting',
							files: [
								'scripts/services/userinfo.js',
								'scripts/controllers/staff/userdata.js',
							]
						})
					}
				}
			})

	}]);

