const express = require('express');
const userRouter = express.Router();
const objectID = require('mongodb').ObjectID;
const util = require('util');
const database = require('../controllers/database')();

var router = function () {
    userRouter.route('/')
        .all(function (req, res, next) {
            if (!req.session.user) {
                res.redirect('/auth/login');
            } else {
                next();
            }
        })
        .get(function (req, res) {
            console.log(req.session.user._id);
            database.getOrders({
                'user._id': req.session.user._id
            }, function(orders) {
                console.log(orders.length, 'orders found');
                
                res.render('landing', {
                    user: req.session.user,
                    orders: orders
                });
            });
        });
        
    userRouter.route('/newOrder')
        .all(function (req, res, next) {
            if (!req.session.user) {
                res.redirect('/auth/login');
            } else {
                next();
            }
        })
        .get(function (req, res) {
            database.getShops({}, function (shops) {
                res.render('map', {
                    user: req.session.user,
                    shops: shops
                });
            });
        });

    userRouter.route('/profile')
        .all(function (req, res, next) {
            if (!req.session.user) {
                res.redirect('/auth/login');
            } else {
                next();
            }
        })
        .get(function (req, res) {
            res.render('profile', {
                user: req.session.user
            });
        })
        .post(function (req, res) {
            var user = {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email
            }

            database.updateUser({
                _id: objectID(req.body.userID)
            }, user, function (response) {
                delete req.session.user;
                res.redirect('/user/profile');
            })
        });

    return userRouter;
};

module.exports = router;