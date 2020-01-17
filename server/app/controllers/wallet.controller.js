'use strict';

require('rootpath')();

var md5 = require('md5');
var nodemailer = require('nodemailer');

var model_user = require('server/app/models/user.model');
var model_request = require('server/app/models/depositrequest.model');
var env_config = require('server/config/development');

var service = require('server/app/controllers/service.controller');

var self = this;

exports.request_all = function (req, res) {

    model_request.find({}, function (err, result) {
        if (!result) {
            return res.status(200).json({
                result: 0,
                message: "no request"
            });
        }

        return res.status(200).json({
            result: 1,
            message: "all requests",
            requests: result,
        });
    });
}

exports.request_add = function (req, res) {
    var newRequest = new model_request(req.body);
    newRequest.created_at = Date();
    newRequest.save(function (err, result) {
        if (err) {
            return res.status(200).json({
                result: -1,
                message: err.message
            });
        }
        return res.status(200).json({
            result: 1,
            message: "request success",
            request: result,
        });
    });
}

exports.request_approve = function (req, res) {
    model_request.findOne({ _id: req.body._id }, function (err, request) {
        if (!request) {
            return res.status(200).json({
                result: -1,
                message: "request does not exist",
                request: request,
            });
        }

        if (request.status != "Waiting") {
            return res.status(200).json({
                result: -1,
                message: "request does not waiting",
                request: request,
            });
        }

        model_user.findOne({ user_id: request.requester }, function (err, user) {
            if (!user) {
                return res.status(200).json({
                    result: -1,
                    message: "user does not exist",
                    request: request,
                });
            }

            if (request.request_type == "Deposit") {
                user.user_wallet += request.request_amount;

                model_user.findOneAndUpdate({ user_id: request.requester }, { $set: user }, { new: true }, function (err, result) {
                    if (err) {
                        return res.status(200).json({
                            result: -1,
                            message: err.message
                        });
                    }

                    request.status = "Approved";
                    request.save();

                    return res.status(200).json({
                        result: 1,
                        message: "success",
                        user: user,
                        request: request,
                    });
                });

            }
            else if (request.request_type == "Withdrawal") {

                if (user.user_wallet < request.request_amount) {
                    return res.status(200).json({
                        result: -1,
                        message: 'wallet not enough',
                        request: request,
                    });
                }
                user.user_wallet -= request.request_amount;

                model_user.findOneAndUpdate({ user_id: request.requester }, { $set: user }, { new: true }, function (err, result) {
                    if (err) {
                        return res.status(200).json({
                            result: -1,
                            message: err.message,
                            request: request,
                        });
                    }

                    request.status = "Approved";
                    request.save();

                    return res.status(200).json({
                        result: 1,
                        message: "success",
                        user: user,
                        request: request,
                    });
                });
            }
        })
    });
}

exports.request_dismiss = function (req, res) {
    model_request.findOne({ _id: req.body._id }, function (err, request) {
        if (!request) {
            return res.status(200).json({
                result: -1,
                message: "request does not exist",
            });
        }

        if (request.status != "Waiting") {
            return res.status(200).json({
                result: -1,
                message: "request does not waiting",
            });
        }

        request.status = "Dismiss";
        request.save(function (err, result) {
            if (err) {
                return res.status(200).json({
                    result: -1,
                    message: err.message
                });
            }
            return res.status(200).json({
                result: 1,
                message: "success",
                request: result,
            });
        });
    });
}

exports.request_remove = function (req, res) {
    model_request.findOneAndRemove({ _id: req.body._id }, function (err, request) {
        if (err) {
            return res.status(200).json({
                result: -1,
                message: err.message,
            });
        }

        return res.status(200).json({
            result: 1,
            message: "success",
            request: request,
        });
    });
}

