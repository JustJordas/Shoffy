const mongodb = require('mongodb').MongoClient;
const objectId = require('mongodb').ObjectID;

//Hashing passwords for security concerns
const crypto = require('crypto');
const secret = 'Amazing';

//Database link
const url = 'mongodb://admin:awesome@ds161939.mlab.com:61939/shoffy';

const database = function () {

    const saveUser = function (user, callback) {
        mongodb.connect(url, function (err, client) {
            if (err) {
                console.log('Error saving user', err);
                throw err;
            }

            const db = client.db('shoffy');
            const collection = db.collection('users');

            user.email = user.email.toLowerCase();
            user.password = crypto.createHash('sha256', secret).update(user.password).digest('hex');

            console.log('After hashing:', user.password);

            collection.findOne({
                email: user.email.toLowerCase()
            }, function (err, result) {
                if (err) {
                    throw err;
                }

                var response = {
                    state: false
                }

                if (!result) {
                    collection.insertOne(user, function (err, result) {
                        if (!err) {
                            response.state = true;
                            response.object = result.ops[0];

                            delete response.object.password;

                            return callback(response);
                        } else {
                            throw err;
                            return callback(response);
                        }
                    });
                } else {
                    return callback(response);
                }
            });
        });
    }

    const loginUser = function (user, callback) {
        mongodb.connect(url, function (err, client) {
            if (err) {
                console.log('Error loging user', err);
                throw err;
            }

            const db = client.db('shoffy');
            const collection = db.collection('users');

            user.email = user.email.toLowerCase();
            if (!user.type || user.type == 'shoffy') {
                delete user.type;
                user.password = crypto.createHash('sha256', secret).update(user.password).digest('hex');

                console.log('Logging via Shoffy', user);

                collection.findOne({
                    email: user.email,
                    password: user.password
                }, function (err, result) {
                    if (err) {
                        throw err;
                    }

                    var response = {
                        state: false
                    }

                    if (result) {
                        response.state = true;
                        response.object = result;

                        delete response.object.password;

                        return callback(response);
                    } else {
                        return callback(response);
                    }
                });
            } else if (user.type == 'fb') {
                delete user.type;
                collection.findOne({
                    email: user.email
                }, function (err, result) {
                    if (err) {
                        throw err;
                    }

                    var response = {
                        state: false
                    }

                    if (result) {
                        if (result.fbid) {
                            if (result.fbid == user.fbid) {
                                response.state = true;
                                response.object = result;

                                delete response.object.password;

                                return callback(response);
                            } else {
                                return callback(response);
                            }
                        } else {
                            collection.updateOne(result, {
                                $set: {
                                    fbid: user.fbid,
                                    firstName: user.firstName,
                                    lastName: user.lastName
                                }
                            }, function (err, responseUpdate) {
                                if (err) {
                                    throw err;
                                }

                                console.log('Adding FB to Shoffy complete');

                                response.state = true;
                                response.object = result;
                                response.object.fbid = user.fbid;
                                response.object.firstName = user.firstName;
                                response.object.lastName = user.lastName;

                                delete response.object.password;

                                return callback(response);
                            });
                        }
                    } else {
                        collection.insertOne(user, function (err, result) {
                            if (!err) {
                                response.state = true;
                                response.object = result.ops[0];

                                delete response.object.password;

                                return callback(response);
                            } else {
                                throw err;
                                return callback(response);
                            }
                        });

                        return callback(response);
                    }
                });
            } else {
                return callback(response);
            }
        });
    }

    const updateUser = function (filter, update, callback) {
        mongodb.connect(url, function (err, client) {
            const db = client.db('shoffy');

            const collection = db.collection('users');

            /*
                As we are matching based on the whole, if the password exists, we shall encrypt it is well, to match the DB records
            */
            if (filter.password) {
                filter.password = crypto.createHmac('sha256', secret).update(filter.password).digest('hex');
            }

            /*
                If the update contains a password, it means it was added in plain text, by an user. Hence, we shall hash it
            */
            if (update.password) {
                update.password = crypto.createHmac('sha256', secret).update(update.password).digest('hex');
            }

            collection.updateOne(filter, {
                '$set': update
            }, function (err, result) {
                var response = {
                    state: false
                }

                if (!err) {
                    response.state = true;

                    if (result.modifiedCount == 0) {
                        response.state = false;
                    }

                    return callback(response);
                } else {
                    return callback(response);
                }
            })
        });
    }

    const saveShop = function (shop, callback) {
        mongodb.connect(url, function (err, client) {
            if (err) {
                console.log('Error saving shop', err);
                throw err;
            }

            const db = client.db('shoffy');
            const collection = db.collection('shops');

            collection.insertOne(shop, function (err, result) {
                var response = {
                    state: false
                }

                if (!err) {
                    response.state = true;
                    response.object = result.ops[0];

                    return callback(response);
                } else {
                    throw err;
                    return callback(response);
                }
            });
        });
    }

    const getShops = function (filter, callback) {
        mongodb.connect(url, function (err, client) {
            const db = client.db('shoffy');

            const collection = db.collection('shops');

            collection.find(filter).toArray(function (err, results) {
                return callback(results);
            });
        });
    }

    const updateShops = function (filter, update, callback) {
        mongodb.connect(url, function (err, client) {
            const db = client.db('shoffy');

            const collection = db.collection('shops');

            collection.updateOne(filter, {
                '$set': update
            }, function (err, result) {
                var response = {
                    state: false
                }

                console.log('Update shops error:', err);

                if (!err) {
                    response.state = true;

                    return callback(response);
                } else {
                    return callback(response);
                }
            })
        });
    }

    const saveProduct = function (product, callback) {
        mongodb.connect(url, function (err, client) {
            if (err) {
                console.log('Error saving product', err);
                throw err;
            }

            const db = client.db('shoffy');
            const collection = db.collection('products');

            collection.insertOne(product, function (err, result) {
                var response = {
                    state: false
                }

                if (!err) {
                    response.state = true;
                    response.object = result.ops[0];

                    return callback(response);
                } else {
                    throw err;
                    return callback(response);
                }
            });
        });
    }

    const getProducts = function (filter, callback) {
        mongodb.connect(url, function (err, client) {
            const db = client.db('shoffy');

            const collection = db.collection('products');

            collection.find(filter).toArray(function (err, results) {
                return callback(results);
            });
        });
    }

    const updateProducts = function (filter, update, callback) {
        mongodb.connect(url, function (err, client) {
            const db = client.db('shoffy');

            const collection = db.collection('products');

            collection.updateOne(filter, {
                '$set': update
            }, {
                upsert: true
            }, function (err, result) {
                var response = {
                    state: false
                }

                console.log('Update products error:', err);

                if (!err) {
                    response.state = true;

                    return callback(response);
                } else {
                    return callback(response);
                }
            })
        });
    }

    return {
        saveUser: saveUser,
        loginUser: loginUser,
        updateUser: updateUser,
        saveShop: saveShop,
        getShops: getShops,
        updateShops: updateShops,
        saveProduct: saveProduct,
        getProducts: getProducts,
        updateProducts: updateProducts
    }
}

module.exports = database;