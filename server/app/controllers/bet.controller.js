'use strict';

require('rootpath')();

var md5 = require('md5');
var nodemailer = require('nodemailer');

var model_user = require('server/app/models/user.model');
var model_bet = require('server/app/models/bet.model');
var model_counter = require('server/app/models/counter.model');
var model_setting = require('server/app/models/setting.model');
var model_week = require('server/app/models/week.model');
var model_terminal = require('server/app/models/terminal.model');
var model_game = require('server/app/models/game.model');
var model_summary = require('server/app/models/summary.model');
var model_deleterequest = require('server/app/models/deleterequest.model');
var env_config = require('server/config/development');

var service = require('server/app/controllers/service.controller');

var self = this;

exports.bet_all = function (req, res) {

	model_bet.find(req.body, function (err, result) {
		if (!result) {
			return res.status(200).json({
				result: 0,
				message: "no request"
			});
		}

		return res.status(200).json({
			result: 1,
			message: "all bets",
			requests: result,
		});
	});
}

exports.bet_add = function (req, res) {
	model_setting.findOne({}, function (err, setting) {

		if (!setting) {
			return res.status(200).json({
				result: -1,
				message: "no setting"
			});
		}

		if (setting.current_week == undefined) {
			return res.status(200).json({
				result: -1,
				message: "no current weekno"
			});
		}

		model_week.findOne({ week_no: setting.current_week }, function (err, cur_week) {
			if (!cur_week) return res.status(200).json({
				result: -1,
				message: "no current week"
			});

			if (cur_week.start_at.getTime() > Date.now() || cur_week.close_at.getTime() < Date.now()) {
				return res.status(200).json({
					result: -1,
					message: "coming soon"
				});
			}

			var newBet = new model_bet(req.body);
			newBet.bet_id = Math.floor(Math.random() * 9000000 + 1000000);
			newBet.bet_time = Date();
			newBet.week = setting.current_week;

			var line = 0;

			if (newBet.type == "Nap/Perm") {
				var n = newBet.gamelist.length;
				line = 0;
				for (var i = 0; i < newBet.under.length; i++) {
					if (newBet.under[i] <= n) {
						var eachline = 1;
						for (var j = 0; j < newBet.under[i]; j++)
							eachline = eachline * (n - j) / (j + 1);
						line += eachline;
					}
				}
			}
			else if (newBet.type == "Group") {
				line = 1;
				for (var i = 0; i < newBet.gamelist.length; i++) {
					var eachline = 1;
					var subunder = newBet.gamelist[i].under;
					var n = newBet.gamelist[i].list.length;
					if (subunder == 0)
						continue;

					if (subunder > n) {
						line = 0;
						break;
					}
					for (var j = 0; j < subunder; j++)
						eachline = eachline * (n - j) / (j + 1);

					line = line * eachline;
				}
			}

			if (line == 0) {
				return res.status(200).json({
					result: -1,
					message: 'apl is 0',
				});
			}

			newBet.apl = newBet.stake_amount / line;

			if (newBet.apl == 0) {
				return res.status(200).json({
					result: -1,
					message: 'apl is 0',
				});
			}

			if (newBet.option == "") {
				newBet.option = cur_week.options[0].name;
			}

			model_user.findOne({ user_email: newBet.player_id }, function (err, player) {
				if (player.user_wallet < newBet.stake_amount) {
					return res.status(200).json({
						result: -1,
						message: 'wallet is not enough',
					});
				}

				newBet.save(function (err, result) {
					if (err) {
						return res.status(200).json({
							result: -1,
							message: err.message
						});
					}
					player.user_wallet -= newBet.stake_amount;
					player.save();

					model_summary.findOne({ summary_id: 'user' + result.option + result.week }, function (err, summary) {
						if (summary == undefined) {
							summary = new model_summary({
								week_no: result.week,
								agent_id: 'user',
								terminal_no: 'user',
								option: result.option,
								summary_id: 'user' + result.option + result.week,
								win: 0,
								payable: 0,
								sales: 0,
								commission: 100,
							});
						}
						summary.sales += result.stake_amount;
						summary.payable = summary.sales;
						summary.save(function (err, res_summary) {
							return res.status(200).json({
								result: 1,
								message: "request success",
								bet: result,
							});
						});
					})
				});
			})

		})
	});
}

exports.bet_dismiss = function (req, res) {
	model_deleterequest.findOne({ bet_id: req.body._id }, function (err, request) {
		if (request) {
			request.status = "Dismiss";
			request.save(function (err, result) {
				if (err) {
					return res.status(200).json({
						result: -1,
						message: err.message,
					});
				}
				return res.status(200).json({
					result: 1,
					message: "success",
				});
			});
		}
	})
}

exports.bet_void = function (req, res) {
	model_bet.findOne({ _id: req.body._id }, function (err, bet) {
		if (!bet) {
			return res.status(200).json({
				result: -1,
				message: "bet does not exist",
			});
		}

		bet.status = "Void";

		model_deleterequest.findOneAndUpdate({ bet_id: req.body._id }, { $set: { status: "Approved" } }, { new: true }, function (err, request) {
		})

		model_bet.findOneAndUpdate({ _id: req.body._id }, { $set: bet }, { new: true }, function (err, bet) {

			if (!bet) {
				return res.status(200).json({
					result: -1,
					message: "bet does not exist",
				});
			}

			if (bet.terminal_id == "") {
				calcUserIndividualSummary(bet.week, bet.option);
			}
			else {
				model_terminal.findOne({ terminal_no: bet.terminal_id }, function (err, terminal) {

					if (terminal)
						calcTerminalSummary(terminal.terminal_no, terminal.agent_id, bet.option, terminal.options.find(function (elem) { return elem.name == bet.option; }).commission, bet.week);

				})
			}

			return res.status(200).json({
				result: 1,
				message: "request success",
				request: bet,
			});
		});
	})
}

exports.bet_unvoid = function (req, res) {
	model_bet.findOne({ _id: req.body._id }, function (err, bet) {
		if (!bet) {
			return res.status(200).json({
				result: -1,
				message: "bet does not exist",
			});
		}

		bet.status = "Active";

		model_bet.findOneAndUpdate({ _id: req.body._id }, { $set: bet }, { new: true }, function (err, bet) {

			if (!bet) {
				return res.status(200).json({
					result: -1,
					message: "bet does not exist",
				});
			}

			model_terminal.findOne({ terminal_no: bet.terminal_id }, function (err, terminal) {

				if (terminal)
					calcTerminalSummary(terminal.terminal_no, terminal.agent_id, bet.option, terminal.options.find(function (elem) { return elem.name == bet.option; }).commission, bet.week);

			})

			return res.status(200).json({
				result: 1,
				message: "request success",
				request: bet,
			});
		});
	})
}

exports.bet_remove = function (req, res) {
	model_bet.findOneAndRemove({ _id: req.body._id }, function (err, result) {
		if (!result) {
			return res.status(200).json({
				result: -1,
				message: "bet does not exist",
			});
		}

		return res.status(200).json({
			result: 1,
			message: "request success",
			request: result,
		});
	})
}

exports.bet_voidrequest = function (req, res) {
	model_bet.findOne({ _id: req.body._id }, function (err, bet) {
		if (!bet) {
			return res.status(200).json({
				result: -1,
				message: "bet does not exist",
			});
		}

		var deleterequest = new model_deleterequest({
			bet_id: bet._id,
			status: "Waiting",
			terminal_id: bet.terminal_id,
			agent_id: agent_id,
		});

		deleterequest.save(function (err, request) {
			if (err) {
				return res.status(200).json({
					result: -1,
					message: err.message,
				});
			}
			return res.status(200).json({
				result: 1,
				message: "request success",
				request: request,
			});
		});

	})
}

exports.voidrequests = function (req, res) {
	model_deleterequest.find(req.body, function (err, requests) {
		model_bet.find({}, function (err, bets) {
			var bettosend = [];
			for (var i = 0; i < requests.length; i++) {
				function sameId(element) {
					return element._id == requests[i].bet_id;
				}
				var index = bets.findIndex(sameId);
				if (index != -1) {
					bettosend.push(bets[index]);
				}
			}
			return res.status(200).json({
				result: 1,
				message: "success",
				requests: requests,
				bets: bettosend,
			});
		})
	})
}

var calcTerminalSummary = function (terminal_no, agent_id, option, commission, week_no) {
	model_summary.findOneAndRemove({ summary_id: terminal_no + option + week_no }, function (err, summary) {
		var summary = new model_summary({
			terminal_no: terminal_no,
			agent_id: agent_id,
			option: option,
			commission: commission,
			week_no: week_no,
			summary_id: terminal_no + option + week_no,
		});
		model_bet.find({ week: week_no, terminal_id: summary.terminal_no, option: summary.option, status: 'Active' }, function (err, bets) {
			for (var k = 0; k < bets.length; k++) {
				summary.sales += bets[k].stake_amount;
				if (bets[k].win_result == 'Win')
					summary.win += bets[k].won_amount;
			}
			summary.payable = summary.sales * summary.commission / 100;
			summary.save();
		});
	});
}

exports.calcSummary = function (week) {
	model_terminal.find({}, function (err, terminals) {

		for (var i = 0; i < terminals.length; i++) {
			if (terminals[i].status != true)
				continue;
			for (var j = 0; j < terminals[i].options.length; j++) {
				terminals[i].options[j].current = false;
			}
			for (var j = 0; j < week.options.length; j++) {
				function hasSameName(element, index, array) {
					return element.name == week.options[j].name;
				}
				var index = terminals[i].options.findIndex(hasSameName);

				if (index == -1) {
					terminals[i].options.push({ name: week.options[j].name });
					index = terminals[i].options.length - 1;
				}

				if (terminals[i].options[index].status == undefined)
					terminals[i].options[index].status = true;

				if (terminals[i].options[index].commission == undefined)
					terminals[i].options[index].commission = 0;

				terminals[i].options[index].current = true;
			}
			for (var j = 0; j < terminals[i].options.length; j++) {
				if (terminals[i].options[j].current != true || terminals[i].options[j].status != "true")
					continue;

				calcTerminalSummary(terminals[i].terminal_no, terminals[i].agent_id, terminals[i].options[j].name, terminals[i].options[j].commission, week.week_no);

			}

		}
	})
}

var calcSummary = function (week) {
	model_terminal.find({}, function (err, terminals) {

		for (var i = 0; i < terminals.length; i++) {
			if (terminals[i].status != true)
				continue;
			for (var j = 0; j < terminals[i].options.length; j++) {
				terminals[i].options[j].current = false;
			}
			for (var j = 0; j < week.options.length; j++) {
				function hasSameName(element, index, array) {
					return element.name == week.options[j].name;
				}
				var index = terminals[i].options.findIndex(hasSameName);

				if (index == -1) {
					terminals[i].options.push({ name: week.options[j].name });
					index = terminals[i].options.length - 1;
				}

				if (terminals[i].options[index].status == undefined)
					terminals[i].options[index].status = true;

				if (terminals[i].options[index].commission == undefined)
					terminals[i].options[index].commission = 0;

				terminals[i].options[index].current = true;
			}
			for (var j = 0; j < terminals[i].options.length; j++) {
				if (terminals[i].options[j].current != true || terminals[i].options[j].status != "true")
					continue;

				calcTerminalSummary(terminals[i].terminal_no, terminals[i].agent_id, terminals[i].options[j].name, terminals[i].options[j].commission, week.week_no);

			}

		}
	})
}

var calcUserIndividualSummary = function (week_no, option) {
	model_summary.findOne({ summary_id: 'user' + option + week_no }, function (err, summary) {
		if (summary == undefined) {
			summary = new model_summary({
				week_no: week_no,
				agent_id: 'user',
				terminal_no: 'user',
				option: option,
				summary_id: 'user' + option + week_no,
				win: 0,
				payable: 0,
				sales: 0,
				commission: 100,
			});
		}
		else {
			summary.win = 0;
			summary.payable = 0;
			summary.sales = 0;
		}
		model_bet.find({ week: summary.week_no, terminal_id: '', option: summary.option, status: 'Active' }, function (err, bets) {
			for (var i = 0; i < bets.length; i++) {
				summary.win += bets[i].won_amount;
				summary.sales += bets[i].stake_amount;
			}
			summary.payable = summary.sales;
			summary.save();
		})
	})
}

var calcUserSummary = function (week) {
	for (var i = 0; i < week.options.length; i++) {
		calcUserIndividualSummary(week.week_no, week.options[i].name);
	}
}

exports.bet_draw = function (req, res) {
	model_setting.findOne({}, function (err, setting) {

		if (!setting) {                     // no setting
			return res.status(200).json({
				result: -1,
				message: "no setting",
			});
		}

		var cur_weekno = setting.current_week;

		if (!cur_weekno) {                    // no current weekno
			return res.status(200).json({
				result: -1,
				message: "no current weekno",
			});
		}

		model_week.findOne({ week_no: cur_weekno }, function (err, week) {
			if (!week) {
				return res.status(200).json({
					result: -1,
					message: "no current week",
				});
			}

			if (week.close_at.getTime() > Date.now()) {
				return res.status(200).json({
					result: -1,
					message: "current week have not closed",
				});
			}

			if (week.options.length == 0) {
				return res.status(200).json({
					result: -1,
					message: "no option",
				});
			}

			var prize = [];

			for (var i = 0; i < week.options.length; i++) {
				if (week.options[i].prize == undefined) {
					return res.status(200).json({
						result: -1,
						message: "input prize value",
					});
				}
				for (var j = 0; j < 4; j++) {
					if (week.options[i].prize[j] == undefined || Math.floor(week.options[i].prize[j]) <= 0) {
						return res.status(200).json({
							result: -1,
							message: "input prize value",
						});
					}
				}
				prize[week.options[i].name] = week.options[i].prize;
			}

			model_game.find({ week_no: cur_weekno, status: true, checked: true }, function (err, games) {
				if (!games) {
					return res.status(200).json({
						result: -1,
						message: "game does not exist",
					});
				}

				var results = new Array(50);
				results.fill(false);

				games.forEach(function (element) {
					results[element.game_no] = true;
				}, this);

				model_bet.find({ week: cur_weekno }, function (err, bets) {
					if (!bets) {
						return res.status(200).json({
							result: -1,
							message: "no bet exist",
						});
					}

					for (var k = 0; k < bets.length; k++) {
						var won_amount = 0;
						var bet = bets[k];

						if (bet.status == 'Void') {
							won_amount = 0;
						}
						else if (bet.type == "Nap/Perm") {
							bet.scorelist = [];

							for (var l = 0; l < bet.gamelist.length; l++) {
								if (results[bet.gamelist[l]] == true)
									bet.scorelist.push(bet.gamelist[l]);
							}

							var n = bet.scorelist.length;
							for (var i = 0; i < bet.under.length; i++) {
								if (bet.under[i] > n)
									continue;
								var winningline = 1;
								for (var j = 0; j < bet.under[i]; j++)
									winningline = winningline * (n - j) / (j + 1);
								won_amount += winningline * prize[bet.option][bet.under[i] - 3];
							}

						}
						else if (bet.type == "Group") {
							bet.scorelist = [];
							won_amount = 1;
							for (var i = 0; i < bet.gamelist.length; i++) {
								bet.scorelist.push({ under: bet.gamelist[i].under, list: [] });
								for (var l = 0; l < bet.gamelist[i].list.length; l++) {
									if (results[bet.gamelist[i].list[l]] == true)
										bet.scorelist[i].list.push(bet.gamelist[i].list[l]);
								}

								var n = bet.scorelist[i].list.length;

								if (n < bet.scorelist[i].under)
									won_amount = 0;

								if (won_amount == 0)
									continue;

								for (var j = 0; j < bet.gamelist[i].under; j++)
									won_amount = won_amount * (n - j) / (j + 1);

							}
							won_amount *= prize[bet.option][bet.under[0] - 3];
						}

						won_amount *= bet.apl;

						if (won_amount > 0) {
							bet.win_result = "Win";
						} else {
							bet.win_result = "Loss";
						}

						bet.won_amount = Math.round(won_amount);

						bet.save(function (err, result) {
							if (err) {
								return res.status(200).json({
									result: -1,
									message: err.message,
								});
							}
						})
					};

					calcSummary(week);
					calcUserSummary(week);

					return res.status(200).json({
						result: 1,
						message: "success",
					});
				})


			});
		});

	});

}

exports.summary_total = function (req, res) {
	model_setting.findOne({}, function (err, setting) {

		if (!setting) {                     // no setting
			return res.status(200).json({
				result: -1,
				message: "no setting",
			});
		}

		req.body.week_no = setting.current_week;

		model_summary.find(req.body, function (err, summaries) {
			var total_sale = 0;
			var total_payable = 0;
			var total_winning = 0;
			var bal_agent = '';
			var bal_company = '';
			var status = '';

			for (var i = 0; i < summaries.length; i++) {
				total_sale += summaries[i].sales;
				total_payable += summaries[i].payable;
				total_winning += summaries[i].win;
			}

			if (total_payable > total_winning) {
				bal_company = total_payable - total_winning;
				status = "green";
			}
			else {
				bal_agent = total_winning - total_payable;
				status = "red";
			}

			return res.status(200).json({
				result: 1,
				message: "success",
				total_summary: {
					total_sale: total_sale,
					total_payable: total_payable,
					total_winning: total_winning,
					bal_agent: bal_agent,
					bal_company: bal_company,
					status: status,
				},
			});
		})
	});
}

exports.summary_terminal = function (req, res) {
	model_setting.findOne({}, function (err, setting) {

		if (!setting) {                     // no setting
			return res.status(200).json({
				result: -1,
				message: "no setting",
			});
		}

		var cur_weekno = setting.current_week;

		req.body.week_no = cur_weekno;

		model_summary.find({ ...req.body, terminal_no: { $ne: 'user' } }, function (err, summaries) {
			var terminal_summary = [];

			for (var i = 0; i < summaries.length; i++) {
				function findTeminal(element) {
					return element.terminal_no == summaries[i].terminal_no;
				}
				var index = terminal_summary.findIndex(findTeminal);
				if (index == -1) {
					terminal_summary.push({
						agent_id: summaries[i].agent_id,
						terminal_no: summaries[i].terminal_no,
						options: [],
						sales: [],
						payable: [],
						total_payable: 0,
						total_win: 0,
						bal_agent: "",
						bal_company: "",
						status: "",
					});
					index = terminal_summary.length - 1;
				}
				terminal_summary[index].options.push(summaries[i].option);
				terminal_summary[index].sales.push(summaries[i].sales);
				terminal_summary[index].payable.push(summaries[i].payable);
				terminal_summary[index].total_payable += summaries[i].payable;
				terminal_summary[index].total_win += summaries[i].win;
			}

			for (var i = 0; i < terminal_summary.length; i++) {
				if (terminal_summary[i].total_payable > terminal_summary[i].total_win) {
					terminal_summary[i].bal_company = terminal_summary[i].total_payable - terminal_summary[i].total_win;
					terminal_summary[i].status = 'green';
				}
				else {
					terminal_summary[i].bal_agent = terminal_summary[i].total_win - terminal_summary[i].total_payable;
					terminal_summary[i].status = 'red';
				}
			}

			return res.status(200).json({
				result: 1,
				message: "success",
				terminal_summary: terminal_summary,
			});
		})
	});
}

exports.summary_agent = function (req, res) {
	model_setting.findOne({}, function (err, setting) {

		if (!setting) {                     // no setting
			return res.status(200).json({
				result: -1,
				message: "no setting",
			});
		}

		req.body.week_no = setting.current_week;

		model_user.find({ user_role: 'agent' }, function (err, agents) {
			model_summary.find({ ...req.body, terminal_no: { $ne: 'user' } }, function (err, summaries) {
				var terminal_summary = [];
				var agent_summary = [];

				for (var i = 0; i < summaries.length; i++) {
					function findTeminal(element) {
						return element.terminal_no == summaries[i].terminal_no;
					}
					var index = terminal_summary.findIndex(findTeminal);

					if (index == -1) {
						terminal_summary.push({
							staff_id: agents.find(function (elem) {
								return elem.user_id == summaries[i].agent_id;
							}).user_staff,
							agent_id: summaries[i].agent_id,
							terminal_no: summaries[i].terminal_no,
							options: [],
							sales: [],
							payable: [],
							total_payable: 0,
							win: 0,
							total_win: 0,
							bal_agent: "",
							bal_company: "",
							status: "",
						});
						index = terminal_summary.length - 1;
					}
					terminal_summary[index].options.push(summaries[i].option);
					terminal_summary[index].sales.push(summaries[i].sales);
					terminal_summary[index].payable.push(summaries[i].payable);
					terminal_summary[index].total_payable += summaries[i].payable;
					terminal_summary[index].win += summaries[i].win;
				}

				for (var i = 0; i < terminal_summary.length; i++) {
					function findAgent(element) {
						return element.agent_id == terminal_summary[i].agent_id;
					}
					var index = agent_summary.findIndex(findAgent);

					if (index == -1) {
						agent_summary.push({
							agent_id: terminal_summary[i].agent_id,
							total_payable: 0,
							total_win: 0,
							bal_agent: "",
							bal_company: "",
							status: "",
						});
						index = agent_summary.length - 1;
					}
					agent_summary[index].total_payable += terminal_summary[i].total_payable;
					agent_summary[index].total_win += terminal_summary[i].win;
				}

				for (var i = 0; i < agent_summary.length; i++) {
					if (agent_summary[i].total_payable > agent_summary[i].total_win) {
						agent_summary[i].bal_company = agent_summary[i].total_payable - agent_summary[i].total_win;
						agent_summary[i].status = 'green';
					}
					else {
						agent_summary[i].bal_agent = agent_summary[i].total_win - agent_summary[i].total_payable;
						agent_summary[i].status = 'red';
					}
				}

				for (var i = 0; i < terminal_summary.length; i++) {
					function findAgent(element) {
						return element.agent_id == terminal_summary[i].agent_id;
					}
					var index = agent_summary.findIndex(findAgent);

					if (index != -1) {
						terminal_summary[i].total_payable = agent_summary[index].total_payable;
						terminal_summary[i].total_win = agent_summary[index].total_win;
						terminal_summary[i].bal_agent = agent_summary[index].bal_agent;
						terminal_summary[i].bal_company = agent_summary[index].bal_company;
						terminal_summary[i].status = agent_summary[index].status;
					}
				}

				return res.status(200).json({
					result: 1,
					message: "success",
					agent_summary: terminal_summary,
				});
			})
		})
	});
}

exports.summary_staff = function (req, res) {
	model_setting.findOne({}, function (err, setting) {

		if (!setting) {                     // no setting
			return res.status(200).json({
				result: -1,
				message: "no setting",
			});
		}

		req.body.week_no = setting.current_week;

		model_user.find({ user_role: 'agent' }, function (err, agents) {
			model_summary.find({ ...req.body, terminal_no: { $ne: 'user' } }, function (err, summaries) {
				var staff_summary = [];

				for (var i = 0; i < summaries.length; i++) {
					var staff_id = agents.find(function (elem) {
						return elem.user_id == summaries[i].agent_id;
					}).user_staff;

					var index = staff_summary.findIndex(function (elem) {
						return elem.staff_id == staff_id;
					})

					if (index == -1) {
						staff_summary.push({
							staff_id: staff_id,
							options: [],
							sales: [],
							payable: 0,
							total_win: 0,
							bal_agent: 0,
							bal_company: 0,
							status: '',
						});
						index = staff_summary.length - 1;
					}

					var option_index = staff_summary[index].options.findIndex(function (elem) { return elem == summaries[i].option });

					if (option_index == -1) {
						staff_summary[index].options.push(summaries[i].option);
						staff_summary[index].sales.push(0);
						option_index = staff_summary[index].options.length - 1;
					}

					staff_summary[index].sales[option_index] += summaries[i].sales;
					staff_summary[index].payable += summaries[i].payable;
					staff_summary[index].total_win += summaries[i].win;
				}

				for (var i = 0; i < staff_summary.length; i++) {
					if (staff_summary[i].payable > staff_summary[i].total_win) {
						staff_summary[i].bal_company = staff_summary[i].payable - staff_summary[i].total_win;
						staff_summary[i].status = 'green';
					}
					else {
						staff_summary[i].bal_agent = staff_summary[i].total_win - staff_summary[i].payable;
						staff_summary[i].status = 'red';
					}
				}

				return res.status(200).json({
					result: 1,
					message: "success",
					staff_summary: staff_summary,
				});
			})
		})
	});
}

// exports.summary_staff = function (req, res) {
// 	model_setting.findOne({}, function (err, setting) {

// 		if (!setting) {                     // no setting
// 			return res.status(200).json({
// 				result: -1,
// 				message: "no setting",
// 			});
// 		}

// 		req.body.week_no = setting.current_week;

// 		model_user.find({ user_role: 'agent' }, function (err, agents) {
// 			model_summary.find({ ...req.body, terminal_no: { $ne: 'user' } }, function (err, summaries) {
// 				var terminal_summary = [];
// 				var staff_summary = [];

// 				for (var i = 0; i < summaries.length; i++) {
// 					function findTeminal(element) {
// 						return element.terminal_no == summaries[i].terminal_no;
// 					}
// 					var index = terminal_summary.findIndex(findTeminal);
// 					if (index == -1) {
// 						var agentIndex = agents.findIndex(function (elem) {
// 							return elem.user_id == summaries[i].agent_id;
// 						});
// 						terminal_summary.push({
// 							staff_id: agents[agentIndex].user_staff,
// 							agent_id: summaries[i].agent_id,
// 							terminal_no: summaries[i].terminal_no,
// 							options: [],
// 							sales: [],
// 							payable: [],
// 							total_payable: 0,
// 							win: 0,
// 							total_win: 0,
// 							bal_agent: "",
// 							bal_company: "",
// 							status: "",
// 						});
// 						index = terminal_summary.length - 1;
// 					}
// 					terminal_summary[index].options.push(summaries[i].option);
// 					terminal_summary[index].sales.push(summaries[i].sales);
// 					terminal_summary[index].payable.push(summaries[i].payable);
// 					terminal_summary[index].total_payable += summaries[i].payable;
// 					terminal_summary[index].win += summaries[i].win;
// 				}

// 				for (var i = 0; i < terminal_summary.length; i++) {
// 					function findStaff(element) {
// 						return element.staff_id == terminal_summary[i].staff_id;
// 					}
// 					var index = staff_summary.findIndex(findStaff);

// 					if (index == -1) {
// 						staff_summary.push({
// 							staff_id: terminal_summary[i].staff_id,
// 							total_payable: 0,
// 							total_win: 0,
// 							bal_agent: "",
// 							bal_company: "",
// 							status: "",
// 						});
// 						index = staff_summary.length - 1;
// 					}
// 					staff_summary[index].total_payable += terminal_summary[i].total_payable;
// 					staff_summary[index].total_win += terminal_summary[i].win;
// 				}

// 				for (var i = 0; i < staff_summary.length; i++) {
// 					if (staff_summary[i].total_payable > staff_summary[i].total_win) {
// 						staff_summary[i].bal_company = staff_summary[i].total_payable - staff_summary[i].total_win;
// 						staff_summary[i].status = 'green';
// 					}
// 					else {
// 						staff_summary[i].bal_agent = staff_summary[i].total_win - staff_summary[i].total_payable;
// 						staff_summary[i].status = 'red';
// 					}
// 				}

// 				for (var i = 0; i < terminal_summary.length; i++) {
// 					function findStaff(element) {
// 						return element.staff_id == terminal_summary[i].staff_id;
// 					}
// 					var index = staff_summary.findIndex(findStaff);

// 					if (index != -1) {
// 						terminal_summary[i].total_payable = staff_summary[index].total_payable;
// 						terminal_summary[i].total_win = staff_summary[index].total_win;
// 						terminal_summary[i].bal_agent = staff_summary[index].bal_agent;
// 						terminal_summary[i].bal_company = staff_summary[index].bal_company;
// 						terminal_summary[i].status = staff_summary[index].status;
// 					}
// 				}

// 				return res.status(200).json({
// 					result: 1,
// 					message: "success",
// 					staff_summary: terminal_summary,
// 				});
// 			})
// 		})
// 	});
// }

exports.report_staff = function (req, res) {
	model_setting.findOne({}, function (err, setting) {

		if (!setting) {                     // no setting
			return res.status(200).json({
				result: -1,
				message: "no setting",
			});
		}

		req.body.week_no = setting.current_week;

		model_user.find({ user_role: 'agent' }, function (err, agents) {
			model_summary.find({ ...req.body, terminal_no: { $ne: 'user' } }, function (err, summaries) {
				var terminal_summary = [];
				var staff_summary = [];

				for (var i = 0; i < summaries.length; i++) {
					function findTeminal(element) {
						return element.terminal_no == summaries[i].terminal_no;
					}
					var index = terminal_summary.findIndex(findTeminal);
					if (index == -1) {
						var agentIndex = agents.findIndex(function (elem) {
							return elem.user_id == summaries[i].agent_id;
						});
						terminal_summary.push({
							staff_id: agents[agentIndex].user_staff,
							agent_id: summaries[i].agent_id,
							terminal_no: summaries[i].terminal_no,
							options: [],
							sales: [],
							payable: [],
							total_payable: 0,
							win: 0,
							total_win: 0,
							bal_agent: "",
							bal_company: "",
							status: "",
						});
						index = terminal_summary.length - 1;
					}
					terminal_summary[index].options.push(summaries[i].option);
					terminal_summary[index].sales.push(summaries[i].sales);
					terminal_summary[index].payable.push(summaries[i].payable);
					terminal_summary[index].total_payable += summaries[i].payable;
					terminal_summary[index].win += summaries[i].win;
				}

				for (var i = 0; i < terminal_summary.length; i++) {
					function findStaff(element) {
						return element.staff_id == terminal_summary[i].staff_id;
					}
					var index = staff_summary.findIndex(findStaff);

					if (index == -1) {
						staff_summary.push({
							staff_id: terminal_summary[i].staff_id,
							total_payable: 0,
							total_win: 0,
							bal_agent: "",
							bal_company: "",
							status: "",
						});
						index = staff_summary.length - 1;
					}
					staff_summary[index].total_payable += terminal_summary[i].total_payable;
					staff_summary[index].total_win += terminal_summary[i].win;
				}

				for (var i = 0; i < staff_summary.length; i++) {
					if (staff_summary[i].total_payable > staff_summary[i].total_win) {
						staff_summary[i].bal_company = staff_summary[i].total_payable - staff_summary[i].total_win;
						staff_summary[i].status = 'green';
					}
					else {
						staff_summary[i].bal_agent = staff_summary[i].total_win - staff_summary[i].total_payable;
						staff_summary[i].status = 'red';
					}
				}

				for (var i = 0; i < terminal_summary.length; i++) {
					function findStaff(element) {
						return element.staff_id == terminal_summary[i].staff_id;
					}
					var index = staff_summary.findIndex(findStaff);

					if (index != -1) {
						terminal_summary[i].total_payable = staff_summary[index].total_payable;
						terminal_summary[i].total_win = staff_summary[index].total_win;
						terminal_summary[i].bal_agent = staff_summary[index].bal_agent;
						terminal_summary[i].bal_company = staff_summary[index].bal_company;
						terminal_summary[i].status = staff_summary[index].status;
					}
				}

				return res.status(200).json({
					result: 1,
					message: "success",
					staff_summary: terminal_summary,
				});
			})
		})
	});
}

exports.summary_user = function (req, res) {
	model_setting.findOne({}, function (err, setting) {

		if (!setting) {                     // no setting
			return res.status(200).json({
				result: -1,
				message: "no setting",
			});
		}

		var cur_weekno = setting.current_week;

		model_summary.find({ week_no: cur_weekno, agent_id: 'user', terminal_no: 'user' }, function (err, summaries) {
			var user_summary = {
				options: [],
				sales: [],
				total_sales: 0,
				win: [],
				total_win: 0,
				bal_agent: "",
				bal_company: "",
				status: "",
			};

			for (var i = 0; i < summaries.length; i++) {
				user_summary.options.push(summaries[i].option);
				user_summary.sales.push(summaries[i].sales);
				user_summary.total_sales += summaries[i].sales;
				user_summary.win.push(summaries[i].win);
				user_summary.total_win += summaries[i].win;
			}

			if (user_summary.total_sales > user_summary.total_win) {
				user_summary.bal_company = user_summary.total_sales - user_summary.total_win;
				user_summary.status = 'green';
			}
			else {
				user_summary.bal_agent = user_summary.total_win - user_summary.total_sales;
				user_summary.status = 'red';
			}

			return res.status(200).json({
				result: 1,
				message: "success",
				user_summary: user_summary,
			});
		})
	});
}

exports.details = function (req, res) {
	model_bet.count(req.body, function (err, bet_cnt) {
		var agentIds = { user_role: 'agent' };

		if (req.body.$or) {
			agentIds = { $or: [], user_role: 'agent' };

			for (var i = 0; i < req.body.$or.length; i++) {
				agentIds.$or.push({ user_id: req.body.$or[i].agent_id });
			}
		}

		model_user.count(agentIds, function (err, agent_cnt) {
			model_terminal.count(req.body, function (err, terminal_cnt) {
				model_deleterequest.count(req.body, function (err, deleterequest_cnt) {
					model_deleterequest.count({ ...req.body, status: 'Approved' }, function (err, approved_cnt) {
						model_deleterequest.count({ ...req.body, status: 'Dismiss' }, function (err, dismiss_cnt) {
							return res.status(200).json({
								result: 1,
								message: "success",
								bet_cnt: bet_cnt,
								agent_cnt: agent_cnt,
								terminal_cnt: terminal_cnt,
								deleterequest_cnt: deleterequest_cnt,
								approved_cnt: approved_cnt,
								dismiss_cnt: dismiss_cnt,
							});
						})
					})
				})
			})
		})
	})
}

exports.clearbets = function (req, res) {
	model_bet.remove({}, function (err, bets) {
		return res.status(200).json({
			result: 1,
			message: "success",
		});
	});
}
