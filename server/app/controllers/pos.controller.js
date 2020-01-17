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
var crypto = require('crypto');
var service = require('server/app/controllers/service.controller');


var self = this;

exports.login = function (req, res) {

	if (req.body.sn == "" || req.body.sn == undefined) {
		return res.status(200).json({
			result: 1001,
			message: "sn is empty"
		});
	}

	model_terminal.findOne({ terminal_no: req.body.sn }, function (err, terminal) {
		if (!terminal) {
			return res.status(200).json({
				result: 1001,
				message: "sn is not exist"
			});
		}

		if (terminal.status != true) {
			return res.status(200).json({
				result: 1001,
				message: "terminal is not allowed"
			});
		}

		if (req.body.password == undefined) {
			return res.status(200).json({
				result: 1002,
				message: "password required"
			});
		}

		if (terminal.password != md5(req.body.password)) {
			return res.status(200).json({
				result: 1002,
				message: "wrong password"
			});
		}

		crypto.randomBytes(32, (err, token) => {
			if (err) throw err;

			terminal.token = token.toString('hex');
			terminal.save();

			function possibleOption(option) {
				return option.current == 'true' && option.status == 'true';
			}

			var options = [];

			for (var i = 0; i < terminal.options.length; i++) {
				if (terminal.options[i].status == 'true' && terminal.options[i].current == 'true') {
					options.push(terminal.options[i].name);
				}
			}

			var unders = [];

			for (var i = 0; i < 4; i++) {
				if (terminal.unders[i] == 'true') {
					unders.push('U' + (i + 3));
				}
			}

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

					model_game.find({ week_no: cur_week.week_no, status: true }, function (err, games) {

						var games_send = [];
						for (var i = 0; i < games.length; i++) {
							games_send.push(games[i].game_no);
						}
						games_send.sort();

						return res.status(200).json({
							sn: terminal.terminal_no,
							result: 1,
							token: terminal.token,
							message: "success",
							data: {
								default_type: terminal.default_type,
								default_sort: terminal.default_sort,
								default_under: terminal.default_under,
								possible_sort: options,
								possible_under: unders,
								games: games_send,
								week_no: cur_week.week_no,
								start_at: cur_week.start_at,
								close_at: cur_week.close_at,
								validity: cur_week.validity,
								void_bet: cur_week.void_bet,
								credit_limit: terminal.credit_limit,
							}
						});
					})
				})
			})
		});
	});

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
		model_bet.find({ week: week_no, terminal_id: summary.terminal_no, option: summary.option }, function (err, bets) {
			for (var k = 0; k < bets.length; k++) {
				summary.sales += bets[k].stake_amount;
				summary.win += bets[k].won_amount;
			}
			summary.payable = summary.sales * summary.commission / 100;
			summary.save();
		});
	});
}


exports.make_bet = function (req, res) {
	if (req.body.sn == undefined || req.body.sn == "") {
		return res.status(200).json({
			result: 1001,
			message: "sn required",
		});
	}

	model_terminal.findOne({ terminal_no: req.body.sn }, function (err, terminal) {
		if (!terminal) {
			return res.status(200).json({
				result: 1001,
				message: "sn does not exist",
			});
		}

		if (terminal.token != req.body.token) {
			return res.status(200).json({
				result: 1002,
				message: "token mismatch",
			});
		}

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
				if (!cur_week)
					return res.status(200).json({
						result: -1,
						message: "no current week"
					});

				if (cur_week.start_at.getTime() > Date.now() || cur_week.close_at.getTime() < Date.now()) {
					return res.status(200).json({
						result: -1,
						message: "coming soon"
					});
				}

				if (req.body.ticket_no == undefined || req.body.ticket_no == '') {
					return res.status(200).json({
						result: -1,
						message: "ticket no required"
					});
				}

				model_bet.findOne({ ticket_no: req.body.ticket_no }, function (err, bet) {

					if (bet) {
						return res.status(200).json({
							result: -1,
							message: "ticket no duplicate error"
						});
					}

					model_bet.find({ week: cur_week.week_no, terminal_id: terminal.terminal_no }, function (err, bets) {

						var resultBets = [];
						var bet_time = Date();

						for (var l = 0; l < req.body.bets.length; l++) {
							if (req.body.bets[l].option == "" || req.body.bets[l].option == undefined)
								req.body.bets[l].option = terminal.default_sort;

							if (req.body.bets[l].under == undefined || req.body.bets[l].under.length == 0)
								req.body.bets[l].under = [parseInt(terminal.default_under.substring(1))];

							if (req.body.bets[l].stake_amount < terminal.min_stake) {
								resultBets.push({
									result: -3,
									message: 'stake amount is less than min_stake',
									type: req.body.bets[l].type,
									option: req.body.bets[l].option,
									gamelist: req.body.bets[l].gamelist,
									stake_amount: req.body.bets[l].stake_amount,
								});
								continue;
							}

							if (req.body.bets[l].stake_amount > terminal.max_stake) {
								resultBets.push({
									result: -3,
									message: 'stake amount is greater than max_stake',
									type: req.body.bets[l].type,
									option: req.body.bets[l].option,
									gamelist: req.body.bets[l].gamelist,
									stake_amount: req.body.bets[l].stake_amount,
								});
								continue;
							}

							if (terminal.credit_limit < req.body.bets[l].stake_amount) {
								resultBets.push({
									result: -3,
									message: 'credit lack',
									type: req.body.bets[l].type,
									option: req.body.bets[l].option,
									gamelist: req.body.bets[l].gamelist,
									stake_amount: req.body.bets[l].stake_amount,
								});
								continue;
							}

							var newBet = new model_bet({
								bet_time: bet_time,
								ticket_no: req.body.ticket_no,
								terminal_id: terminal.terminal_no,
								agent_id: terminal.agent_id,
								stake_amount: req.body.bets[l].stake_amount,
								gamelist: req.body.bets[l].gamelist,
								week: cur_week.week_no,
								under: req.body.bets[l].under,
								option: req.body.bets[l].option,
								type: req.body.bets[l].type,
							});

							newBet.bet_id = Math.floor(Math.random() * 9000000 + 1000000);

							for (var i = 0; i < bets.length; i++) {
								if (bets[i].type != req.body.bets[l].type)
									continue;

								if (bets[i].stake_amount != req.body.bets[l].stake_amount)
									continue;

								if (bets[i].option != req.body.bets[l].option)
									continue;

								var flagSame = false;

								if (newBet.type == 'Group') {
									if (bets[i].gamelist.length == newBet.gamelist.length) {
										for (var j = 0; j < newBet.gamelist.length; j++) {
											newBet.gamelist[j].list.sort();
											if (bets[i].gamelist[j].under != newBet.gamelist[j].under)
												break;

											if (bets[i].gamelist[j].list.length != newBet.gamelist[j].list.length)
												break;
											for (var k = 0; k < newBet.gamelist[j].list.length; k++)
												if (bets[i].gamelist[j].list[k] != newBet.gamelist[j].list[k])
													break;
											if (k != newBet.gamelist[j].list.length)
												break;
										}
										if (j == newBet.gamelist.length) {
											flagSame = true;
										}
									}
								}
								else if (newBet.type == 'Nap/Perm') {
									newBet.gamelist.sort();
									if (newBet.gamelist.length == bets[i].gamelist.length) {
										for (var j = 0; j < newBet.gamelist.length; j++) {
											if (newBet.gamelist[j] != bets[i].gamelist[j])
												break;
										}
										if (j == newBet.gamelist.length) {
											flagSame = true;
										}
									}
								}

								if (flagSame == 1)
									break;
							}

							if (i < bets.length) {
								resultBets.push({
									result: -1,
									message: 'bet already exist',
									type: newBet.type,
									option: newBet.option,
									gamelist: newBet.gamelist,
									stake_amount: newBet.stake_amount,
								});
								continue;
							}

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
								resultBets.push({
									result: -2,
									message: 'apl is zero',
									type: newBet.type,
									option: newBet.option,
									gamelist: newBet.gamelist,
									stake_amount: newBet.stake_amount,
								});
								continue;
							}

							newBet.apl = newBet.stake_amount / line;

							terminal.credit_limit -= newBet.stake_amount;
							terminal.save();

							newBet.save(function (err, result) {
								if (err) {
									return res.status(200).json({
										result: -1,
										message: err.message
									});
								}
								calcTerminalSummary(terminal.terminal_no, terminal.agent_id, newBet.option, terminal.options.find(function (elem) { return elem.name == newBet.option; }).commission, cur_week.week_no);
							});

							bets.push(newBet);

							resultBets.push({
								result: 1,
								message: 'success',
								type: newBet.type,
								option: newBet.option,
								gamelist: newBet.gamelist,
								stake_amount: newBet.stake_amount,
								bet_id: newBet.bet_id,
								apl: newBet.apl,
							});
						}

						return res.status(200).json({
							result: {
								ticket_no: req.body.ticket_no,
								bet_time: bet_time,
								week: cur_week.week_no,
								agent_id: terminal.agent_id,
								terminal_id: terminal.terminal_no,
								bets: resultBets,
							},
						});

					});

				})
			})
		});
	})

}

exports.results = function (req, res) {
	if (req.body.sn == undefined || req.body.sn == "") {
		return res.status(200).json({
			result: 1001,
			message: "sn required",
		});
	}

	model_terminal.findOne({ terminal_no: req.body.sn }, function (err, terminal) {
		if (!terminal) {
			return res.status(200).json({
				result: 1001,
				message: "sn does not exist",
			});
		}

		if (terminal.token != req.body.token) {
			return res.status(200).json({
				result: 1002,
				message: "token mismatch",
			});
		}
		model_game.find({ week_no: req.body.week_no, status: true, checked: true }, function (err, games) {

			var games_send = [];
			for (var i = 0; i < games.length; i++) {
				games_send.push(games[i].game_no);
			}
			games_send.sort();
			return res.status(200).json({
				result: 1,
				message: "success",
				data: {
					week_no: req.body.week_no,
					drawn: games_send,
				}
			});
		})
	})
}

exports.reprint = function (req, res) {
	if (req.body.sn == undefined || req.body.sn == "") {
		return res.status(200).json({
			result: 1001,
			message: "sn required",
		});
	}

	model_terminal.findOne({ terminal_no: req.body.sn }, function (err, terminal) {
		if (!terminal) {
			return res.status(200).json({
				result: 1001,
				message: "sn does not exist",
			});
		}

		if (terminal.token != req.body.token) {
			return res.status(200).json({
				result: 1002,
				message: "token mismatch",
			});
		}

		model_bet.find({ ticket_no: req.body.ticket_no }, function (err, bets) {

			if (bets.length == 0) {
				return res.status(200).json({
					result: 1002,
					message: "ticket_no does not exist",
				});
			}

			var bet_time = bets[0].bet_time;
			var week = bets[0].week_no;
			var agent_id = bets[0].agent_id;
			var terminal_id = bets[0].terminal_id;

			bets = bets.map(function (obj) {
				return {
					type: obj.type,
					option: obj.option,
					gamelist: obj.gamelist,
					stake_amount: obj.stake_amount,
				}
			})

			return res.status(200).json({
				result: 1,
				message: "success",
				ticket_no: req.body.ticket_no,
				week: week,
				agent_id: agent_id,
				terminal_id: terminal_id,
				bets: bets,
			});
		})
	})
}

exports.win_list = function (req, res) {
	if (req.body.sn == undefined || req.body.sn == "") {
		return res.status(200).json({
			result: 1001,
			message: "sn required",
		});
	}

	model_terminal.findOne({ terminal_no: req.body.sn }, function (err, terminal) {
		if (!terminal) {
			return res.status(200).json({
				result: 1001,
				message: "sn does not exist",
			});
		}

		if (terminal.token != req.body.token) {
			return res.status(200).json({
				result: 1002,
				message: "token mismatch",
			});
		}

		model_setting.findOne({}, function (err, setting) {

			var week_no = req.body.week;

			if (!week_no) {
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

				week_no = setting.current_week;
			}

			model_week.findOne({ week_no: week_no }, function (err, cur_week) {
				if (!cur_week) {
					return res.status(200).json({
						result: -1,
						message: "no current week"
					});
				}

				var data = { terminal_id: req.body.sn, win_result: "Win", week: cur_week.week_no };

				if (req.body.ticket_no != undefined)
					data['ticket_no'] = req.body.ticket_no;

				model_bet.find(data, function (err, bets) {
					var win_list = [];
					for (var i = 0; i < bets.length; i++) {
						var index = win_list.findIndex(function (elem) {
							return elem.ticket_no == bets[i].ticket_no;
						});

						if (index == -1) {
							win_list.push({
								ticket_no: bets[i].ticket_no,
								bet_id: [],
								amount: [],
								total_winning: 0,
							})
							index = win_list.length - 1;
						}

						if (bets[i].bet_id == undefined)
							bets[i].bet_id = "";

						win_list[index].bet_id.push(bets[i].bet_id);
						win_list[index].amount.push(bets[i].won_amount);
						win_list[index].total_winning += bets[i].won_amount;
					}

					return res.status(200).json({
						result: 1,
						message: "success",
						week: cur_week.week_no,
						win_list: win_list,
					});
				})
			})
		})
	})
}

exports.report = function (req, res) {
	if (req.body.sn == undefined || req.body.sn == "") {
		return res.status(200).json({
			result: 1001,
			message: "sn required",
		});
	}

	model_terminal.findOne({ terminal_no: req.body.sn }, function (err, terminal) {
		if (!terminal) {
			return res.status(200).json({
				result: 1001,
				message: "sn does not exist",
			});
		}

		if (terminal.token != req.body.token) {
			return res.status(200).json({
				result: 1002,
				message: "token mismatch",
			});
		}

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
				if (!cur_week) {
					return res.status(200).json({
						result: -1,
						message: "no current week"
					});
				}

				model_summary.find({ week_no: cur_week.week_no, terminal_no: req.body.sn }, function (err, summaries) {
					var terminal_summary = {
						total_sale: 0,
						total_payable: 0,
						total_win: 0,
						bal_agent: "",
						bal_company: "",
						status: "",
					};

					var odd_summary = [];

					for (var i = 0; i < summaries.length; i++) {
						terminal_summary.total_sale += summaries[i].sales;
						terminal_summary.total_payable += summaries[i].payable;
						terminal_summary.total_win += summaries[i].win;
						odd_summary.push({
							option: summaries[i].option,
							sale: summaries[i].sales,
							payable: summaries[i].payable,
							win: summaries[i].win,
						});
					}

					if (terminal_summary.total_payable > terminal_summary.total_win) {
						terminal_summary.bal_company = terminal_summary.total_payable - terminal_summary.total_win;
						terminal_summary.status = 'green';
					}
					else {
						terminal_summary.bal_agent = terminal_summary.total_win - terminal_summary.total_payable;
						terminal_summary.status = 'red';
					}

					return res.status(200).json({
						result: 1,
						message: "success",
						terminal_summary: terminal_summary,
						odd_summary: odd_summary,
					});
				})
			})
		})
	})
}

exports.credit_limit = function (req, res) {
	if (req.body.sn == undefined || req.body.sn == "") {
		return res.status(200).json({
			result: 1001,
			message: "sn required",
		});
	}

	model_terminal.findOne({ terminal_no: req.body.sn }, function (err, terminal) {
		if (!terminal) {
			return res.status(200).json({
				result: 1001,
				message: "sn does not exist",
			});
		}

		if (terminal.token != req.body.token) {
			return res.status(200).json({
				result: 1002,
				message: "token mismatch",
			});
		}
		return res.status(200).json({
			result: 1,
			message: "success",
			credit_limit: terminal.credit_limit,
		});
	})
}

exports.logout = function (req, res) {
	if (req.body.sn == undefined || req.body.sn == "") {
		return res.status(200).json({
			result: 1001,
			message: "sn required",
		});
	}

	model_terminal.findOne({ terminal_no: req.body.sn }, function (err, terminal) {
		if (!terminal) {
			return res.status(200).json({
				result: 1001,
				message: "sn does not exist",
			});
		}

		if (terminal.token != req.body.token) {
			return res.status(200).json({
				result: 1002,
				message: "token mismatch",
			});
		}

		crypto.randomBytes(32, (err, token) => {
			if (err) throw err;

			terminal.token = token.toString('hex');
			terminal.save();
		})

		return res.status(200).json({
			result: 1,
			message: "success",
		});
	})
}

exports.void_bet = function (req, res) {
	if (req.body.sn == undefined || req.body.sn == "") {
		return res.status(200).json({
			result: 1001,
			message: "sn required",
		});
	}

	model_terminal.findOne({ terminal_no: req.body.sn }, function (err, terminal) {
		if (!terminal) {
			return res.status(200).json({
				result: 1001,
				message: "sn does not exist",
			});
		}

		if (terminal.token != req.body.token) {
			return res.status(200).json({
				result: 1002,
				message: "token mismatch",
			});
		}

		model_bet.findOne({ bet_id: req.body.bet_id }, function (err, bet) {

			if (!bet) {
				return res.status(200).json({
					result: 1002,
					message: "bet_id does not exist",
				});
			}
			model_week.findOne({ week_no: bet.week }, function (err, week) {
				if (!week) {
					return res.status(200).json({
						result: -1,
						message: "week does not exist"
					});
				}

				if (Date.now() - bet.bet_time.getTime() > week.void_bet) {
					return res.status(200).json({
						result: 1004,
						message: "void time passed"
					});
				}
				var newRequest = new model_deleterequest({ bet_id: bet._id, terminal_id: terminal.terminal_no, agent_id: terminal.agent_id });
				newRequest.save(function (err, request) {
					if (err) {
						return res.status(200).json({
							result: 1005,
							message: "already requested",
						});
					}
					return res.status(200).json({
						result: 1,
						message: "success",
					});
				})
			})
		})
	})
}

exports.password_change = function (req, res) {
	if (req.body.sn == undefined || req.body.sn == "") {
		return res.status(200).json({
			result: 1001,
			message: "sn required",
		});
	}

	model_terminal.findOne({ terminal_no: req.body.sn }, function (err, terminal) {
		if (!terminal) {
			return res.status(200).json({
				result: 1001,
				message: "sn does not exist",
			});
		}

		if (terminal.token != req.body.token) {
			return res.status(200).json({
				result: 1002,
				message: "token mismatch",
			});
		}

		if (req.body.new_password == undefined || req.body.new_password == "") {
			return res.status(200).json({
				result: 1003,
				message: "enter new password",
			});
		}

		terminal.password = md5(req.body.new_password);
		terminal.save();

		return res.status(200).json({
			result: 1,
			message: "success",
		});
	})
}

exports.void_list = function (req, res) {
	if (req.body.sn == undefined || req.body.sn == "") {
		return res.status(200).json({
			result: 1001,
			message: "sn required",
		});
	}

	model_terminal.findOne({ terminal_no: req.body.sn }, function (err, terminal) {
		if (!terminal) {
			return res.status(200).json({
				result: 1001,
				message: "sn does not exist",
			});
		}

		if (terminal.token != req.body.token) {
			return res.status(200).json({
				result: 1002,
				message: "token mismatch",
			});
		}

		model_setting.findOne({}, function (err, setting) {

			var week_no = req.body.week;

			if (!week_no) {
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

				week_no = setting.current_week;
			}

			model_week.findOne({ week_no: week_no }, function (err, cur_week) {
				if (!cur_week) {
					return res.status(200).json({
						result: -1,
						message: "no current week"
					});
				}

				model_bet.find({ terminal_id: req.body.sn, status: "Void", week: cur_week.week_no }, function (err, bets) {

					bets = bets.map(function (obj) {
						return {
							bet_id: obj.bet_id,
							type: obj.type,
							option: obj.option,
							gamelist: obj.gamelist,
							stake_amount: obj.stake_amount,
							ticket_no: obj.ticket_no,
						}
					})

					return res.status(200).json({
						result: 1,
						message: "success",
						week: cur_week.week_no,
						void_list: bets,
					});
				})
			})
		})
	})
}

exports.search = function (req, res) {
	if (req.body.sn == undefined || req.body.sn == "") {
		return res.status(200).json({
			result: 1001,
			message: "sn required",
		});
	}

	model_terminal.findOne({ terminal_no: req.body.sn }, function (err, terminal) {
		if (!terminal) {
			return res.status(200).json({
				result: 1001,
				message: "sn does not exist",
			});
		}

		if (terminal.token != req.body.token) {
			return res.status(200).json({
				result: 1002,
				message: "token mismatch",
			});
		}

		model_setting.findOne({}, function (err, setting) {

			var week_no = req.body.week;

			if (!week_no) {
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

				week_no = setting.current_week;
			}

			model_week.findOne({ week_no: week_no }, function (err, cur_week) {
				if (!cur_week) {
					return res.status(200).json({
						result: -1,
						message: "no current week"
					});
				}

				model_bet.find({
					$or: [
						{ bet_id: { $regex: req.body.searchword } },
						{ ticket_no: { $regex: req.body.searchword } }
					],
					terminal_id: req.body.sn,
					week: cur_week.week_no,
				}, function (err, bets) {
					bets = bets.map(function (obj) {
						return {
							bet_id: obj.bet_id,
							type: obj.type,
							option: obj.option,
							gamelist: obj.gamelist,
							stake_amount: obj.stake_amount,
							ticket_no: obj.ticket_no,
							status: obj.status,
						}
					})

					return res.status(200).json({
						result: 1,
						message: "success",
						week: cur_week.week_no,
						search_result: bets,
					});
				})
			})
		})
	})
}



