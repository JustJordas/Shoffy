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

    return {
        saveUser: saveUser,
        loginUser: loginUser
    }
}

module.exports = database;