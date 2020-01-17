'use strict';

require('rootpath')();

var md5 = require('md5');
var nodemailer = require('nodemailer');

var model_game = require('server/app/models/game.model');
var model_setting = require('server/app/models/setting.model');
var env_config = require('server/config/development');

var service = require('server/app/controllers/service.controller');

var self = this;

exports.game_all = function (req, res) {

    if (req.body.week_no == undefined) {
        model_setting.findOne({}, function (err, week) {
            if (week) {
                req.body.week_no = week.current_week;
                model_game.find(req.body, function (err, result) {
                    if (!result) {
                        return res.status(200).json({
                            result: 0,
                            message: "no games"
                        });
                    }
                    return res.status(200).json({
                        result: 1,
                        message: "all games",
                        requests: result,
                        week_no: week.current_week,
                    });
                });
            }
            else {
            }
        })
    }
    else {
        model_game.find(req.body, function (err, result) {
            if (!result) {
                return res.status(200).json({
                    result: 0,
                    message: "no games"
                });
            }
            return res.status(200).json({
                result: 1,
                message: "all games",
                requests: result,
                week_no: req.body.week_no,
            });
        });
    }

}

exports.game_add = function (req, res) {
    model_game.findOne({ week_no: req.body.week_no, game_no: req.body.game_no }, function (err, game) {

        if (game) {
            return res.status(200).json({
                result: -1,
                message: "game already exists"
            });
        }

        var newGame = new model_game(req.body);

        newGame.save(function (err, game) {
            if (err) {
                return res.status(200).json({
                    result: -1,
                    message: err.message,
                });
            }
            return res.status(200).json({
                result: 1,
                message: "success",
                game: game,
            });
        });
    })
}

exports.game_edit = function (req, res) {
    model_game.findOne({ week_no: req.body.week_no, game_no: req.body.game_no, _id: { $lt: req.body._id } }, function (err, game) {
        if (game) {
            return res.status(200).json({
                result: -1,
                message: "game already exists"
            });
        }
        model_game.findOneAndUpdate({ _id: req.body._id }, { $set: req.body }, { new: true }, function (err, game) {

            if (!game) {
                return res.status(200).json({
                    result: -1,
                    message: "game does not exist"
                });
            }

            return res.status(200).json({
                result: 1,
                message: "success",
                game: game,
            });
        });

    });
}

exports.game_delete = function (req, res) {
    model_game.findOneAndRemove(req.body, function (err, game) {

        if (!game) {
            return res.status(200).json({
                result: -1,
                message: "game does not exist"
            });
        }

        return res.status(200).json({
            result: 1,
            message: "success",
            game: game,
        });
    })
}

