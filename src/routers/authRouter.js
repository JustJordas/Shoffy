const express = require('express');
const authRouter = express.Router();
const objectID = require('mongodb').ObjectID;
const util = require('util');
const database = require('../controllers/database')();

var router = function () {
    authRouter.route('/signup')
        .get(function (req, res) {
            res.render('signup', {
                user: req.session.user
            });
        })
        .post(function (req, res) {
            var user = req.body;

            database.saveUser(user, function (response) {
                console.log('After sign up response:', response);

                req.session.user = response.object;

                res.redirect('/');
            });
        });

    authRouter.route('/login')
        .get(function (req, res) {
            if (!req.session.user) {
                res.render('login', {
                    user: req.session.user
                });
            } else {
                res.redirect('/');
            }
        })
        .post(function (req, res) {
            var user = req.body;

            console.log('Received user:', user);

            database.loginUser(user, function (response) {
                console.log(response);
                if (response.state == true) {
                    req.session.user = response.object;

                    console.log('Logged user:', req.session.user);

                    res.redirect('/');
                } else {
                    res.redirect('/auth/login');
                }
            });
        });

    return authRouter;
};

module.exports = router;