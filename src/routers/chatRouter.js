const express = require('express');
const chatRouter = express.Router();
const objectID = require('mongodb').ObjectID;
const util = require('util');
const database = require('../controllers/database')();

var router = function () {
    chatRouter.route('/:chatID/new')
        .all(function (req, res, next) {
            if (!req.session.user) {
                res.redirect('/auth/login');
            } else {
                next();
            }
        })
        .post(function (req, res) {
            //console.log(req.body);
            var message = {
                chatID: objectID(req.params.chatID),
                authorID: objectID(req.body.authorID),
                authorFirstName: req.body.authorFirstName,
                message: req.body.message,
                timestamp: new Date().getTime()
            }

            console.log(message);

            database.saveMessage(message, function(response) {
                console.log(response);
            });
        });

    chatRouter.route('/:chatID/getAll')
        .all(function (req, res, next) {
            if (!req.session.user) {
                res.redirect('/auth/login');
            } else {
                next();
            }
        })
        .post(function (req, res) {
            //console.log(req.body);
            database.getMessages({
                chatID: objectID(req.params.chatID)
            }, function(messages) {
                messages.sort(function(a, b) {
                    return a.timestamp - b.timestamp;
                });

                //console.log(messages);

                res.send(messages);
            });
        });

    return chatRouter;
};

module.exports = router;