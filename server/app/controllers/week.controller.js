'use strict';

require('rootpath')();

var md5 = require('md5');
var nodemailer = require('nodemailer');

var model_user = require('server/app/models/user.model');
var model_week = require('server/app/models/week.model');
var env_config = require('server/config/development');

var service = require('server/app/controllers/service.controller');

var self = this;

exports.week_all = function (req, res) {

    model_week.find({}, function (err, result) {
        if (!result) {
            return res.status(200).json({
                result: 0,
                message: "no week"
            });
        }

        return res.status(200).json({
            result: 1,
            message: "all weeks",
            weeks: result,
        });
    });
}

exports.week_add = function (req, res) {
    var week = new model_week(req.body);
    week.save(function (err, result) {
        if (err) {
            return res.status(200).json({
                result: -1,
                message: err.message
            });
        }
        // self.send_email(result.id, result.user_email, "signup");
        return res.status(200).json({
            result: 1,
            message: "week add success",
            week: result,
        });
    });
}

exports.week_edit = function (req, res) {

    model_week.findOneAndUpdate({ week_no: req.body.week_no }, { $set: req.body }, { new: true }, function (err, result) {
        if (!result) {
            return exports.week_add(req, res);
            // return res.status(200).json({
            //     result: -1,
            //     message: "week_no not exist"
            // });
        }
        else {
            return res.status(200).json({
                result: 1,
                message: "week save success",
                week: result,
            });
        }
    });

}
