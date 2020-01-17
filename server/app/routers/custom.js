'use strict';

require('rootpath')();

var express = require('express');
var authentication = require('server/app/controllers/authentication.controller');
var user = require('server/app/controllers/user.controller');
var week = require('server/app/controllers/week.controller');
var setting = require('server/app/controllers/setting.controller');
var terminal = require('server/app/controllers/terminal.controller');
var wallet = require('server/app/controllers/wallet.controller');
var bet = require('server/app/controllers/bet.controller');
var game = require('server/app/controllers/game.controller');
var pos = require('server/app/controllers/pos.controller');
var router = express.Router();


router.post('/user_signup', authentication.user_signup);
router.post('/user_login', authentication.user_login);
router.get('/confirm_signup', authentication.confirm_signup);
router.post('/forgot_password', authentication.forgot_password);

router.post('/user/user_all', user.user_all);
router.post('/user/user_edit', user.user_edit);
router.post('/user/player_edit', user.player_edit);
router.post('/user/staff_edit', user.staff_edit);
router.post('/user/user_delete', user.user_delete);
router.post('/user/user_wallet', user.user_wallet);

router.post('/week/week_all', week.week_all);
router.post('/week/week_add', week.week_add);
router.post('/week/week_edit', week.week_edit);

router.post('/setting/get_setting', setting.get_setting);
router.post('/setting/set_current', setting.set_currentweek);
router.post('/setting/set_riskmanager', setting.set_riskmanager);
router.post('/setting/option_all', setting.all_options);
router.post('/setting/option_add', setting.add_option);
router.post('/setting/option_edit', setting.edit_option);
router.post('/setting/option_editstatus', setting.edit_optionstatus);
router.post('/setting/option_delete', setting.delete_option);
router.post('/setting/set_prize', setting.set_prize);

router.post('/terminal/terminal_all', terminal.terminal_all);
router.post('/terminal/terminal_add', terminal.terminal_add);
router.post('/terminal/terminal_edit', terminal.terminal_edit);
router.post('/terminal/terminal_delete', terminal.terminal_delete);
router.post('/terminal/save_commission', terminal.save_commission);
router.post('/terminal/credit_add', terminal.credit_add);
router.post('/terminal/all_enable', terminal.all_enable);
router.post('/terminal/all_disable', terminal.all_disable);
router.post('/terminal/terminal_distribution', terminal.terminal_distribution);

router.post('/wallet/request_all', wallet.request_all);
router.post('/wallet/request_add', wallet.request_add);
router.post('/wallet/request_approve', wallet.request_approve);
router.post('/wallet/request_dismiss', wallet.request_dismiss);
router.post('/wallet/request_delete', wallet.request_remove);

router.post('/bet/bet_all', bet.bet_all);
router.post('/bet/bet_add', bet.bet_add);
router.post('/bet/bet_delete', bet.bet_remove);
router.post('/bet/bet_void', bet.bet_void);
router.post('/bet/bet_unvoid', bet.bet_unvoid);
router.post('/bet/bet_dismiss', bet.bet_dismiss);
router.post('/bet/bet_voidrequest', bet.bet_voidrequest);
router.post('/bet/voidrequests', bet.voidrequests);
router.post('/bet/bet_draw', bet.bet_draw);
router.post('/bet/summary_total', bet.summary_total);
router.post('/bet/summary_user', bet.summary_user);
router.post('/bet/summary_terminal', bet.summary_terminal);
router.post('/bet/summary_agent', bet.summary_agent);
router.post('/bet/summary_staff', bet.summary_staff);
router.post('/bet/details', bet.details);
router.post('/bet/clearbets', bet.clearbets);


router.post('/game/game_all', game.game_all);
router.post('/game/game_add', game.game_add);
router.post('/game/game_edit', game.game_edit);
router.post('/game/game_delete', game.game_delete);

router.post('/pos/login', pos.login);
router.post('/pos/logout', pos.logout);
router.post('/pos/make_bet', pos.make_bet);
router.post('/pos/results', pos.results);
router.post('/pos/reprint', pos.reprint);
router.post('/pos/win_list', pos.win_list);
router.post('/pos/report', pos.report);
router.post('/pos/credit_limit', pos.credit_limit);
router.post('/pos/void_bet', pos.void_bet);
router.post('/pos/password_change', pos.password_change);
router.post('/pos/void_list', pos.void_list);
router.post('/pos/search', pos.search);



module.exports = router;

