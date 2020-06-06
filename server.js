const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const passport = require('passport');
const session = require('express-session');
const passportConfig = require('./config/passport')(passport);
const app = express();

mongoose
	.connect('mongodb://localhost:27017/user', {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true,
	})
	.then(() => {
		console.log('db connected');
	});

app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(express.json());
app.use(flash());
app.get('/', (req, res) => {
	res.render('home');
});
app.use(
	session({
		secret: 'keyboard cat',
		resave: true,
		saveUninitialized: true,
		cookie: { secure: false, expires: 600000, httpOnly: false },
	})
);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: true }));
app.use('/users', require('./routes/users'));
app.use('/', require('./routes/index'));
app.listen(5000, () => {
	console.log('server is running on port 5000');
});
