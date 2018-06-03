const express = require('express');
const orderRouter = express.Router();
const objectID = require('mongodb').ObjectID;
const util = require('util');
const database = require('../controllers/database')();

var googleMapsClient = require('@google/maps').createClient({
    key: 'AIzaSyDHfohgtdHeSqkM28bLbqGld5Hw3U_0qTA'
});

var router = function() {
    orderRouter.route('/review')
        .all(function(req, res, next) {
            if (!req.session.user) {
                res.redirect('/auth/login');
            } else {
                next();
            }
        })
        .post(function(req, res) {
            const basket = JSON.parse(req.body.basket);
            const shopID = req.body.shopID;
            var calls = Object.keys(basket).length;

            var order = {
                user: req.session.user,
                shop: {},
                basket: {},
                price: 0.0,
                quantity: 0
            }

            database.getShops({
                _id: objectID(shopID)
            }, function(shops) {
                if (shops.length == 1) {
                    order.shop = shops[0];

                    Object.keys(basket).forEach(function(orderKey) {
                        database.getProducts({
                            _id: objectID(orderKey)
                        }, function(products) {
                            if (products.length == 1) {
                                const product = products[0];

                                order.basket[product._id] = product;
                                order.basket[product._id].available = true;
                                order.basket[product._id].quantity = basket[product._id];

                                calls -= 1;
                            }
                        });
                    });
                }
            });

            const waitForAllCalls = setInterval(function() {
                if (calls == 0) {
                    Object.keys(order.basket).forEach(function(productID) {
                        order.price += order.basket[productID].price * order.basket[productID].quantity;
                        order.quantity += order.basket[productID].quantity;
                    });

                    res.render('orderConfirmation', {
                        order: order,
                        user: req.session.user
                    });

                    clearInterval(waitForAllCalls);
                }
            }, 50);
        });

    orderRouter.route('/new')
        .all(function(req, res, next) {
            if (!req.session.user) {
                res.redirect('/auth/login');
            } else {
                next();
            }
        })
        .post(function(req, res) {
            var order = JSON.parse(req.body.order);
            var address = req.body.address;
            var location;

            googleMapsClient.geocode({
                address: address
            }, function(err, response) {
                if (!err) {
                    console.log(response.json.results[0].geometry.location);

                    address = response.json.results[0].formatted_address;
                    location = response.json.results[0].geometry.location;

                    order.user.address = address;
                    order.user.location = location;
                    order.time = new Date().getTime();
                    order.status = 'pending';
                    order.drivers = [];

                    //console.log(order);
                    database.getUsers({
                        type: 'driver'
                    }, function(drivers) {
                        drivers.forEach(function(driver) {
                            order.drivers.push(driver._id);
                        });


                        console.log(order);

                        database.saveOrder(order, function(response) {
                            console.log(response);

                            res.redirect('/');
                        });
                    });
                }
            });
        });

    orderRouter.route('/:orderID/accept')
        .all(function(req, res, next) {
            if (!req.session.user) {
                res.redirect('/auth/login');
            } else {
                next();
            }
        })
        .get(function(req, res) {
            var filter = {
                _id: objectID(req.params.orderID),
                drivers: {
                    $in: new Array(objectID(req.session.user._id))
                }
            }

            database.getOrders(filter, function(orders) {
                if (orders.length == 1) {
                    var order = orders[0];

                    order.drivers = [];

                    order.driver = req.session.user;
                    order.status = 'in progress';

                    database.updateOrders({
                        _id: objectID(order._id)
                    }, order, function(response) {

                    });

                    res.redirect('/order/' + req.params.orderID);
                } else {
                    res.redirect('/driver/pool');
                }
            });
        });

    orderRouter.route('/:orderID')
        .all(function(req, res, next) {
            if (!req.session.user) {
                res.redirect('/auth/login');
            } else {
                next();
            }
        })
        .get(function(req, res) {
            var filter = {
                _id: objectID(req.params.orderID)
            }

            database.getOrders(filter, function(orders) {
                if (orders.length == 1) {
                    var order = orders[0];

                    res.render('order', {
                        user: req.session.user,
                        order: order
                    });
                } else {
                    res.redirect('/');
                }
            });
        });

    orderRouter.route('/:orderID/completed')
        .all(function(req, res, next) {
            if (!req.session.user) {
                res.redirect('/auth/login');
            } else {
                next();
            }
        })
        .post(function(req, res) {
            console.log(req.session.user);
            if (req.session.user.type == 'driver') {
                database.getOrders({
                    _id: objectID(req.params.orderID)
                }, function(orders) {
                    console.log(orders);
                    if (orders.length == 1) {
                        var order = orders[0];

                        order.status = 'completed';

                        database.updateOrders({
                            _id: objectID(order._id)
                        }, order, function(response) {
                            res.redirect('/driver/pool');
                        });
                    } else {
                        console.log('Error: no order to be completed');
                        res.redirect('/driver/pool');
                    }
                });
            }
        });

    orderRouter.route('/:orderID/basket/:productID/update')
        .all(function(req, res, next) {
            if (!(req.session.user)) {
                res.redirect('/auth/login');
            } else {
                next();
            }
        })
        .post(function(req, res) {
            var update = req.body.update;

            database.getOrders({
                _id: objectID(req.params.orderID)
            }, function(orders) {
                if (orders.length == 1) {
                    var order = orders[0];
                }

                Object.keys(update).forEach(function(key) {
                    order.basket[req.params.productID][key] = update[key];
                });

                database.updateOrders({
                    _id: order._id
                }, order, function(response) {});
            });
        });

    orderRouter.route('/:orderID/basket/:productID/alternative')
        .all(function(req, res, next) {
            if (!(req.session.user)) {
                res.redirect('/auth/login');
            } else {
                next();
            }
        })
        .get(function(req, res) {
            database.getOrders({
                _id: objectID(req.params.orderID)
            }, function(orders) {
                if (orders.length == 1) {
                    var order = orders[0];

                    database.getShops({
                        _id: objectID(order.shop._id)
                    }, function(shops) {
                        if (shops.length == 1) {
                            var shop = shops[0];

                            database.getProducts({
                                shopID: objectID(shop._id)
                            }, function(products) {
                                res.render('alternative', {
                                    user: req.session.user,
                                    shop: shop,
                                    products: products,
                                    order: order,
                                    productUnavID: req.params.productID
                                });
                            });
                        }
                    });
                }
            });
        })
        .post(function(req, res) {
            database.getOrders({
                _id: objectID(req.params.orderID)
            }, function(orders) {
                if (orders.length == 1) {
                    var order = orders[0];

                    delete order.basket[req.params.productID]

                    var newProduct = {};
                    var basket = JSON.parse(req.body.basket)

                    console.log(basket);
                    console.log(Object.keys(basket)[0]);
                    console.log(objectID(Object.keys(basket)[0]));

                    newProduct = {
                        _id: objectID(Object.keys(basket)[0]),
                        amount: basket[Object.keys(basket)[0]]
                    }

                    console.log(newProduct);

                    database.getProducts({
                        _id: objectID(newProduct._id)
                    }, function(products) {
                        if (products.length == 1) {
                            var product = products[0];

                            if (order.basket[product._id] && order.basket[product._id].quantity > 0) {
                                order.price -= parseFloat(order.basket[product._id].price) * order.basket[product._id].quantity;
                            }

                            order.basket[product._id] = product;
                            order.basket[product._id].available = true;
                            order.basket[product._id].quantity = parseInt(newProduct.amount);
                            order.price += parseFloat(order.basket[product._id].price) * order.basket[product._id].quantity;

                            database.updateOrders({
                                _id: order._id
                            }, order, function(response) {
                                res.redirect('/order/' + order._id);
                            });
                        }
                    });
                }
            });
        });

    return orderRouter;
};

module.exports = router;