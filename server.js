const express = require('express');
const expressSession = require('express-session');
const bodyParser = require('body-parser');
//const database = require('./src/controllers/database')();

const authRouter = require('./src/routers/authRouter')();
const adminRouter = require('./src/routers/adminRouter')();
const userRouter = require('./src/routers/userRouter')();
const driverRouter = require('./src/routers/driverRouter')();
const mapRouter = require('./src/routers/mapRouter')();
const shopRouter = require('./src/routers/shopRouter')();
const orderRouter = require('./src/routers/orderRouter')();

const util = require('util');

const app = express();

const sessionOptions = {
	secret: 'ShoffySecretDoNotTell',
	resave: false,
	saveUninitialized: true
};

app.use(bodyParser({ limit: '50mb' }));

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(expressSession(sessionOptions));

// set the view engine to ejs
app.set('views', './src/views');
app.set('view engine', 'ejs');
app.use('/auth', authRouter);
app.use('/admin', adminRouter);
app.use('/user', userRouter);
app.use('/driver', driverRouter);
app.use('/shop', shopRouter);
app.use('/map', mapRouter);
app.use('/order', orderRouter);

// Landing page
app.get('/', function (req, res) {
	if (req.session.user) {
		if (req.session.user.type && req.session.user.type == 'admin') {
			res.redirect('/admin');
		} else if (req.session.user.type && req.session.user.type == 'user') {
			res.redirect('/user');
		} else if (req.session.user.type && req.session.user.type == 'driver') {
			res.redirect('/driver');
		} else {
			res.render('landing', {
				user: req.session.user
			});
		}
	} else {
		res.redirect('/auth/login');
	}
});

app.listen(8080);
console.log("Server started on port: 8080");