'use strict';

require('rootpath')();

var md5 = require('md5');
var nodemailer = require('nodemailer');

var model_user = require('server/app/models/user.model');
var model_terminal = require('server/app/models/terminal.model');
var model_week = require('server/app/models/week.model');
var model_setting = require('server/app/models/setting.model');
var model_summary = require('server/app/models/summary.model');
var env_config = require('server/config/development');

var service = require('server/app/controllers/service.controller');

var self = this;

exports.terminal_all = function (req, res) {
	model_setting.findOne({}, function (err, setting) {

		if (!setting) {					 // no setting
			return res.status(200).json({
				result: -1,
				message: 'no setting',
			});
		}

		var current_week = setting.current_week;

		if (!current_week) {					// no current week
			return res.status(200).json({
				result: -1,
				message: err.message
			});
		}

		model_week.findOne({ week_no: current_week }, function (err, week) {
			if (!week) {
				return res.status(200).json({
					result: -1,
					message: "no current week",
				});
			}

			var options = week.options;

			model_terminal.find(req.body, function (err, terminals) {
				if (!terminals) {
					return res.status(200).json({
						result: 0,
						message: "no week"
					});
				}

				for (var i = 0; i < terminals.length; i++) {
					for (var j = 0; j < terminals[i].options.length; j++) {
						terminals[i].options[j].current = false;
					}
					for (var j = 0; j < options.length; j++) {
						function hasSameName(element, index, array) {
							return element.name == options[j].name;
						}
						var index = terminals[i].options.findIndex(hasSameName);

						if (index == -1) {
							terminals[i].options.push({ name: options[j].name });
							index = terminals[i].options.length - 1;
						}

						if (terminals[i].options[index].status == undefined)
							terminals[i].options[index].status = true;

						if (terminals[i].options[index].commission == undefined)
							terminals[i].options[index].commission = 0;

						terminals[i].options[index].current = true;
					}

					if (terminals[i].unders == undefined)
						terminals[i].unders = ["true", "true", "true", "true"];

					if (terminals[i].unders.length == 0)
						terminals[i].unders = ["true", "true", "true", "true"];

					terminals[i].save();

				}

				return res.status(200).json({
					result: 1,
					message: "all terminals",
					terminals: terminals,
					options: week.options,
				});
			});

		});

	});

}


exports.terminal_add = function (req, res) {
	model_setting.findOne({}, function (err, setting) {

		if (!setting) {					 // no setting
			return res.status(200).json({
				result: -1,
				message: err.message
			});
		}

		var current_week = setting.current_week;

		if (!current_week) {					// no current week
			return res.status(200).json({
				result: -1,
				message: err.message
			});
		}

		model_week.findOne({ week_no: current_week }, function (err, week) {
			if (!week) {
				return res.status(200).json({
					result: -1,
					message: "no current week",
				});
			}

			var options = week.options;

			var newterminal = new model_terminal(req.body);

			if (newterminal.options.length == 0) {
				for (var i = 0; i < options.length; i++) {
					newterminal.options.push({
						name: options[i].name,
						status: "true",
						current: "true",
						commission: 0,
					});
				}
			}

			if (newterminal.unders.length == 0)
				newterminal.unders = ["true", "true", "true", "true"];

			newterminal.password = md5('123456');

			newterminal.save(function (err, terminal) {
				if (err) {
					return res.status(200).json({
						result: -1,
						message: err.message,
					});
				}

				return res.status(200).json({
					result: 1,
					message: "terminal add success",
					terminal: terminal,
				});
			});

		});

	});
}

exports.terminal_delete = function (req, res) {
	model_terminal.findOneAndRemove(req.body, function (err, result) {
		if (!result) {
			return res.status(200).json({
				result: 0,
				message: "terminal does not exist"
			});
		}

		return res.status(200).json({
			result: 1,
			message: "success",
		});
	})
}

exports.terminal_edit = function (req, res) {
	model_terminal.findOneAndUpdate({ _id: req.body._id }, { $set: req.body }, { new: true }, function (err, result) {
		if (!result) {
			return res.status(200).json({
				result: -1,
				message: "terminal does not exist",
			});
		}
		return res.status(200).json({
			result: 1,
			message: "success",
			terminal: result,
		});
	});
}

exports.save_commission = function (req, res) {
	for (var i = 0; i < req.body.data.length; i++) {
		model_terminal.findOneAndUpdate({ _id: req.body.data[i]._id }, { $set: req.body.data[i] }, { new: true }, function (err, result) {
			if (!result) {
				return res.status(200).json({
					result: -1,
					message: "fail",
					_id: req.body.data[i]._id,
				});
			}
		});
	}
}

exports.credit_add = function (req, res) {
	model_terminal.find({}, function (err, terminals) {
		for (var i = 0; i < terminals.length; i++) {
			terminals[i].credit_limit += Number(req.body.credit);
			terminals[i].save();
		}
		return res.status(200).json({
			result: 1,
			message: "success",
		});
	})
}

exports.all_enable = function (req, res) {
	model_terminal.find({}, function (err, terminals) {
		for (var i = 0; i < terminals.length; i++) {
			terminals[i].status = true;
			terminals[i].save();
		}

		return res.status(200).json({
			result: 1,
			message: "success",
		});
	})
}

exports.all_disable = function (req, res) {
	model_terminal.find({}, function (err, terminals) {
		for (var i = 0; i < terminals.length; i++) {
			terminals[i].status = false;
			terminals[i].save();
		}

		return res.status(200).json({
			result: 1,
			message: "success",
		});
	})
}

exports.terminal_distribution = function (req, res) {
	model_terminal.find({}, function (err, terminals) {
		model_user.find({ user_role: 'agent' }, function (err, agents) {

			var diagram = [];

			for (var i = 0; i < terminals.length; i++) {
				diagram.push({
					staff_id: agents.find(function (element) {
						return element.user_id == terminals[i].agent_id;
					}).user_staff,
					agent_id: terminals[i].agent_id,
					terminal_id: terminals[i].terminal_no,
				})
			}

			return res.status(200).json({
				result: 1,
				message: "success",
				terminals: diagram,
			});
		})
	})
}

