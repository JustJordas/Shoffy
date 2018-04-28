const express = require('express');
const expressSession = require('express-session');
const bodyParser = require('body-parser');
//const database = require('./src/controllers/database')();

const authRouter = require('./src/routers/authRouter')();

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

// Landing page
app.get('/', function (req, res) {
	if (req.session.user) {
		res.render('landing.ejs', {
			user: req.session.user
		});
	} else {
		res.redirect('/auth/login');
	}
});

app.listen(8080);
console.log("Server started on port: 8080");