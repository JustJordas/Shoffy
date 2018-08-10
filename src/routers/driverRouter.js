const express = require('express');
const driverRouter = express.Router();
const objectID = require('mongodb').ObjectID;
const util = require('util');
const database = require('../controllers/database')();

var router = function() {
    driverRouter.route('/')
        .all(function(req, res, next) {
            if (!req.session.user) {
                res.redirect('/auth/login');
            } else {
                next();
            }
        })
        .get(function(req, res) {
            if (req.session.user.order && req.session.user.order.status == 'in progress') {
                res.redirect('/order/' + req.session.user.order._id);
            } else if (req.session.user.order && req.session.user.order.status == 'completed') {
                delete req.session.user.order;

                res.redirect('/driver/pool');
            } else {
                res.redirect('/driver/pool');
            }
        });

    driverRouter.route('/pool')
        .all(function(req, res, next) {
            if (!req.session.user) {
                res.redirect('/auth/login');
            } else {
                next();
            }
        })
        .get(function(req, res) {
            database.getOrders({
                'driver._id': req.session.user._id,
                status: 'in progress'
            }, function(personalOrders) {
                console.log('LOCK TEST');
                console.log(personalOrders.length);
                if (personalOrders.length == 1) {
                    const order = personalOrders[0];

                    res.redirect('/order/' + order._id);
                } else if (personalOrders.length == 0) {
                    database.getOrders({
                        status: 'pending',
                        drivers: {
                            $in: new Array(objectID(req.session.user._id))
                        }
                    }, function(orders) {
                        console.log("LOCK TEST 2");
                        //console.log(orders);
                        res.render('mapPool', {
                            user: req.session.user,
                            orders: orders
                        });
                    });
                }
            });
        });

    return driverRouter;
};

module.exports = router;