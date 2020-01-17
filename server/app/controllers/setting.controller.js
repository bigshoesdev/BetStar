'use strict';

require('rootpath')();

var md5 = require('md5');
var nodemailer = require('nodemailer');

var model_setting = require('server/app/models/setting.model');
var model_week = require('server/app/models/week.model');
var model_bet = require('server/app/models/bet.model');
var env_config = require('server/config/development');

var service = require('server/app/controllers/service.controller');

var self = this;

exports.set_currentweek = function (req, res) {
    model_setting.findOne({}, function (err, result) {
        var setting;
        if (result)
            setting = result;
        else
            setting = new model_setting({});

        setting.current_week = req.body.current_week;

        model_week.findOne({ week_no: setting.current_week }, function (err, week) {
            if (!week) {
                return res.status(200).json({
                    result: -1,
                    message: "no current week",
                });
            }

            setting.save(function (err, result) {
                if (err) {
                    return res.status(200).json({
                        result: -1,
                        message: err.message
                    });
                }
                return res.status(200).json({
                    result: 1,
                    message: "success",
                    setting: result,
                    cur_week: week,
                });

            });

        });
    });
}

exports.get_setting = function (req, res) {
    model_setting.findOne({}, function (err, setting) {

        if (!setting) {
            return res.status(200).json({
                result: -1,
                message: "no setting"
            });
        }

        model_week.findOne({ week_no: setting.current_week }, function (err, week) {
            if (!week) {
                return res.status(200).json({
                    result: -1,
                    message: "no current week",
                });
            }

            model_week.find({ status: 'active' }, function (err, allweeks) {
                if (err) {
                    return res.status(200).json({
                        result: -1,
                        message: err.message,
                    });
                }

                model_bet.count({}, function (err, bet_cnt) {

                    return res.status(200).json({
                        result: 1,
                        message: "current seting",
                        setting: setting,
                        cur_week: week,
                        all_weeks: allweeks,
                        bet_cnt: bet_cnt,
                    });
                });
            })
        });
    });
}

exports.set_riskmanager = function (req, res) {
    model_setting.findOne({}, function (err, result) {
        var setting;

        if (result)
            setting = result;
        else
            setting = new model_setting({});

        setting.risk_manager = req.body;

        setting.save(function (err, result) {
            if (err) {
                return res.status(200).json({
                    result: -1,
                    message: err.message
                });
            }

            return res.status(200).json({
                result: 1,
                message: "success",
                setting: result,
            });
        });
    });
}

exports.get_currentweek = function (req, res) {
    model_setting.findOne({}, function (err, setting) {

        if (!setting) {                     // no setting
            return res.status(200).json({
                result: -1,
                message: err.message
            });
        }

        var current_week = setting.current_week;

        if (!current_week) {                    // no current week
            return res.status(200).json({
                result: -1,
                message: err.message
            });
        }

        return res.status(200).json({
            result: 1,
            message: 'success',
            current_week: current_week,
        });
    });
}

exports.all_options = function (req, res) {
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

            return res.status(200).json({
                result: 1,
                message: "all option",
                options: week.options,
            });

        });

    });
}

exports.add_option = function (req, res) {
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

            if (!week.options)
                week.options = [];

            if (!req.body.name) {               // requst err
                return res.status(200).json({
                    result: -1,
                    message: "no option",
                });
            }

            function hasSameName(element, index, array) {
                return element.name == req.body.name;
            }

            if (week.options.findIndex(hasSameName) != -1) { // requst err
                return res.status(200).json({
                    result: -1,
                    message: "option exists",
                });
            }

            week.options.push({ name: req.body.name, status: true });
            week.save(function (err, result) {
                if (err) {
                    return res.status(200).json({
                        result: -1,
                        message: err.message
                    });
                }

                return res.status(200).json({
                    result: 1,
                    message: "success",
                });

            });

        });

    });
}

exports.edit_option = function (req, res) {
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

            if (!week.options)
                week.options = [];

            if (!req.body.oldname) {               // requst err
                return res.status(200).json({
                    result: -1,
                    message: "no old name",
                });
            }

            if (!req.body.newname) {               // requst err
                return res.status(200).json({
                    result: -1,
                    message: "no new name",
                });
            }

            function hasNewName(element, index, array) {
                return element.name == req.body.newname;
            }

            var index = week.options.findIndex(hasNewName);

            if (index != -1) { // requst err
                return res.status(200).json({
                    result: -1,
                    message: "new option already exists",
                });
            }

            function hasOldName(element, index, array) {
                return element.name == req.body.oldname;
            }

            var index = week.options.findIndex(hasOldName);

            if (index == -1) { // requst err
                return res.status(200).json({
                    result: -1,
                    message: "old option does not exist",
                });
            }

            week.options[index].name = req.body.newname;

            model_week.findOneAndUpdate({ week_no: week.week_no }, { $set: week }, { new: true }, function (err, result) {
                if (err) {
                    return res.status(200).json({
                        result: -1,
                        message: err.message
                    });
                }

                return res.status(200).json({
                    result: 1,
                    message: "success",
                });

            });

        });

    });
}

exports.edit_optionstatus = function (req, res) {
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

            var index = week.options.findIndex(function (elem) {
                return elem.name == req.body.option;
            });

            week.options[index].status = req.body.status;

            // week.save();
            model_week.findOneAndUpdate({ week_no: week.week_no }, { $set: week }, { new: true }, function (err, result) {
                if (err) {
                    return res.status(200).json({
                        result: -1,
                        message: err.message
                    });
                }

                return res.status(200).json({
                    result: 1,
                    message: "success",
                });

            });

        });

    });
}

exports.delete_option = function (req, res) {
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

            if (!week.options)
                week.options = [];

            if (!req.body.name) {               // requst err
                return res.status(200).json({
                    result: -1,
                    message: "no name",
                });
            }

            function hasSameName(element, index, array) {
                return element.name == req.body.name;
            }

            var index = week.options.findIndex(hasSameName);

            if (index == -1) { // requst err
                return res.status(200).json({
                    result: -1,
                    message: "option does not exist",
                });
            }

            if (week.options.length <= 1) {
                return res.status(200).json({
                    result: -1,
                    message: "at least one option should be exist",
                });
            }

            week.options.splice(index, 1);

            model_week.findOneAndUpdate({ week_no: week.week_no }, { $set: week }, { new: true }, function (err, result) {
                if (err) {
                    return res.status(200).json({
                        result: -1,
                        message: err.message
                    });
                }

                return res.status(200).json({
                    result: 1,
                    message: "success",
                });

            });

        });

    });
}

exports.set_prize = function (req, res) {
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

            week.options = req.body.options;
            week.save(function (err, result) {
                if (err) {
                    return res.status(200).json({
                        result: -1,
                        message: err.message
                    });
                }

                return res.status(200).json({
                    result: 1,
                    message: "success",
                    week: result,
                });

            });

        });

    });

}

