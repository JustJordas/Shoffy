const express = require('express');
const mapRouter = express.Router();
const objectID = require('mongodb').ObjectID;
const util = require('util');
const database = require('../controllers/database')();

var router = function () {
    mapRouter.route('/')
        .all(function (req, res, next) {
            if (!req.session.user) {
                res.redirect('/auth/login');
            } else {
                next();
            }
        })
        .get(function (req, res) {
            res.render('map', {
                user: req.session.user
            });
        })

    mapRouter.route('/:placeID')
        .all(function (req, res, next) {
            if (!req.session.user) {
                res.redirect('/auth/login');
            } else {
                next();
            }
        })
        .get(function (req, res) {
            res.render('shop', {
                user: req.session.user
            });
        })

    return mapRouter;
};

module.exports = router;