const express = require('express');
const shopRouter = express.Router();
const objectID = require('mongodb').ObjectID;
const util = require('util');
const database = require('../controllers/database')();

var router = function () {
    shopRouter.route('/')
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

    shopRouter.route('/:shopID')
        .all(function (req, res, next) {
            if (!req.session.user) {
                res.redirect('/auth/login');
            } else {
                next();
            }
        })
        .get(function (req, res) {
            database.getShops({
                _id: objectID(req.params.shopID)
            }, function (shops) {
                if (shops.length == 1) {
                    const shop = shops[0];

                    database.getProducts({
                        shopID: objectID(shop._id)
                    }, function (products) {

                        res.render('shop', {
                            user: req.session.user,
                            shop: shop,
                            products: products
                        });
                    });
                } else {
                    res.redirect('/');
                }
            })
        })

    return shopRouter;
};

module.exports = router;