'use strict';

require('rootpath')();

var md5 = require('md5');
var nodemailer = require('nodemailer');

var model_user = require('server/app/models/user.model');
var env_config = require('server/config/development');

var service = require('server/app/controllers/service.controller');

var self = this;

exports.user_all = function (req, res) {

    model_user.find(req.body, function (err, result) {
        if (!result) {
            return res.status(200).json({
                result: 0,
                message: "no " + req.body.role,
            });
        }

        return res.status(200).json({
            result: 1,
            message: "all " + req.body.role,
            users: result,
        });
    });
}

exports.user_edit = function (req, res) {

    if (req.body.user_password != "" && req.body.user_password != undefined)
        req.body.user_password = md5(req.body.user_password);

    if (req.body._id != undefined) {
        model_user.findOneAndUpdate({ _id: req.body._id }, { $set: req.body }, { new: true }, function (err, result) {
            if (!result) {
                return res.status(200).json({
                    result: -1,
                    message: "_id not exist"
                });
            }
            else {
                return res.status(200).json({
                    result: 1,
                    message: "success"
                });
            }
        });
    }
    else {

        if (req.body.user_password == undefined)
            req.body.user_password = md5('123456');

        req.body.user_token = service.token_generator(30);
        req.body.user_createdat = Date();
        var user = new model_user(req.body);

        user.save(function (err, result) {
            if (err) {
                return res.status(200).json({
                    result: -1,
                    message: err.message
                });
            }
            // self.send_email(result.id, result.user_email, "signup");
            return res.status(200).json({
                result: 1,
                message: "success",
                user: result,
            });
        });
    }

}

exports.player_edit = function (req, res) {

    if (req.body.user_password != "" && req.body.user_password != undefined)
        req.body.user_password = md5(req.body.user_password);

    if (req.body._id) {
        model_user.findOneAndUpdate({ _id: req.body._id }, { $set: req.body }, { new: true }, function (err, result) {
            if (!result) {
                return res.status(200).json({
                    result: -1,
                    message: "_id not exist"
                });
            }
            else {
                return res.status(200).json({
                    result: 1,
                    message: "success"
                });
            }
        });
    }
    else {

        if (req.body.user_password == undefined)
            req.body.user_password = md5('123456');
        var user = new model_user({
            user_id: req.body.user_id,
            user_email: req.body.user_email,
            user_password: req.body.user_password,
            user_token: service.token_generator(30),
            user_firstname: req.body.user_firstname,
            user_lastname: req.body.user_lastname,
            user_birthday: req.body.user_birthday,
            user_role: 'agent',
            user_address: req.body.user_address,
            user_city: req.body.user_city,
            user_phonenumber: req.body.user_phonenumber,
            user_avatar: "",
            user_status: true,
            user_createdat: Date(),
        });

        user.save(function (err, result) {
            if (err) {
                return res.status(200).json({
                    result: -1,
                    message: err.message
                });
            }
            // self.send_email(result.id, result.user_email, "signup");
            return res.status(200).json({
                result: 1,
                message: "success",
                user: result,
            });
        });
    }

}

exports.staff_edit = function (req, res) {

    if (req.body.user_password != "" && req.body.user_password != undefined)
        req.body.user_password = md5(req.body.user_password);

    if (req.body._id) {
        model_user.findOneAndUpdate({ _id: req.body._id }, { $set: req.body }, { new: true }, function (err, result) {
            if (!result) {
                return res.status(200).json({
                    result: -1,
                    message: "_id not exist"
                });
            }
            else {
                return res.status(200).json({
                    result: 1,
                    message: "success"
                });
            }
        });
    }
    else {

        if (req.body.user_password == undefined)
            req.body.user_password = md5('123456');
        var user = new model_user({
            user_id: req.body.user_id,
            user_email: req.body.user_email,
            user_password: req.body.user_password,
            user_token: service.token_generator(30),
            user_firstname: req.body.user_firstname,
            user_lastname: req.body.user_lastname,
            user_birthday: req.body.user_birthday,
            user_role: 'staff',
            user_address: req.body.user_address,
            user_city: req.body.user_city,
            user_phonenumber: req.body.user_phonenumber,
            user_avatar: "",
            user_status: true,
            user_createdat: Date(),
        });

        user.save(function (err, result) {
            if (err) {
                return res.status(200).json({
                    result: -1,
                    message: err.message
                });
            }
            // self.send_email(result.id, result.user_email, "signup");
            return res.status(200).json({
                result: 1,
                message: "success",
                staff: result,
            });
        });
    }
}

exports.user_delete = function (req, res) {
    model_user.remove({ _id: req.body._id }, function (err, result) {
        if (!result) {
            return res.status(200).json({
                result: 0,
                message: "fail"
            });
        }

        return res.status(200).json({
            result: 1,
            message: "success",
            user: result,
        });
    });
}

exports.user_wallet = function (req, res) {
    model_user.findOne(req.body, function (err, user) {
        return res.status(200).json({
            result: 1,
            message: "success",
            user_wallet: user.user_wallet,
        });
    })
}