const express = require('express');
const adminRouter = express.Router();
const objectID = require('mongodb').ObjectID;
const util = require('util');
const database = require('../controllers/database')();

var router = function () {
    adminRouter.route('/')
        .all(function (req, res, next) {
            if (!(req.session.user && req.session.user.type && req.session.user.type == 'admin')) {
                res.redirect('/auth/login');
            } else {
                next();
            }
        })
        .get(function (req, res) {
            database.getShops({}, function (shops) {
                res.render('admin', {
                    user: req.session.user,
                    shops: shops
                });
            });
        });

    adminRouter.route('/addShop')
        .all(function (req, res, next) {
            if (!(req.session.user && req.session.user.type && req.session.user.type == 'admin')) {
                res.redirect('/auth/login');
            } else {
                next();
            }
        })
        .get(function (req, res) {
            res.render('newShop', {
                user: req.session.user
            })
        })
        .post(function (req, res) {
            var shop = {
                logo: req.body.logo,
                chain: req.body.chain,
                name: req.body.name,
                postcode: req.body.postcode,
                location: {
                    lat: req.body.lat,
                    long: req.body.long
                },
                products: {}
            }

            database.saveShop(shop, function (response) {
                res.redirect('/admin');
            });
        });

    adminRouter.route('/:shopID/products')
        .all(function (req, res, next) {
            if (!(req.session.user && req.session.user.type && req.session.user.type == 'admin')) {
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
                        shopID: shop._id
                    }, function (products) {
                        res.render('adminProducts', {
                            user: req.session.user,
                            shop: shop,
                            products: products
                        });
                    });
                } else {
                    res.redirect('/admin');
                }
            });
        })
        .post(function (req, res) {
            var products = JSON.parse(req.body.products);

            database.getShop({
                _id: objectID(req.params.shopID)
            }, function (shops) {
                if (shop.length == 1) {
                    products.forEach(function (product) {
                        if (product.changed == 'true') {
                            delete product.changed;

                            database.updateProduct({
                                _id: objectID(product._id)
                            }, product, function (response) {});

                            res.redirect('/admin');
                        }
                    });
                } else {
                    res.redirect('/admin/${req.params.shopID}/products');
                }
            });
        });

    return adminRouter;
};

module.exports = router;