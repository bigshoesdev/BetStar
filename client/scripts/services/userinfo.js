angular.module('betting', [])

	.service('UserInfo_service', function ($location, $state, $interval) {
		// For the purpose of this example I will store user data on ionic local storage but you should save it on a database
		this.setUser = function (user_data) {
			window.localStorage.starter_web_user = JSON.stringify(user_data);
		};

		this.setHeading = function (heading) {
			window.localStorage.heading = heading;
		};

		this.getHeading = function () {
			return window.localStorage.heading;
		};

		this.getUser = function () {
			return JSON.parse(window.localStorage.starter_web_user || '{}');
		};

		this.getUserName = function () {
			return JSON.parse(window.localStorage.starter_web_user || '{}').user_lastname;
		};

		this.getUserId = function () {
			return JSON.parse(window.localStorage.starter_web_user || '{}').user_id;
		};

		this.getUserEmail = function () {
			return JSON.parse(window.localStorage.starter_web_user || '{}').user_email;
		};

		this.getUserRole = function () {
			return JSON.parse(window.localStorage.starter_web_user || '{}').user_role;
		}

		this.getDefaultUrl = function () {
			return JSON.parse(window.localStorage.starter_web_user || '{}').url;
		}

		this.deleteUser = function () {
			window.localStorage.starter_web_user = JSON.stringify([]);
		}

		this.checkUrl = function () {

			var path = $location.path();

			if (path == "/login")
				return true;

			if (path != "/login" && this.getUserRole() == null) {
				$state.go('login');
				return false;
			}

			if (this.getUserRole() != null && path.search(this.getUserRole()) == -1) {
				$state.go(this.getDefaultUrl());
				return false;
			}

			if (path == "/login" && this.getUserRole()) {
				$state.go(this.getDefaultUrl());
				return false;
			}

			return true;
		}

		this.http_config = {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
			}
		}
	})
