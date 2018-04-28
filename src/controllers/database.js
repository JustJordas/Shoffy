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
            user.password = crypto.createHash('sha256', secret).update(user.password).digest('hex');

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
        })
    }

    return {
        saveUser: saveUser,
        loginUser: loginUser
    }
}

module.exports = database;