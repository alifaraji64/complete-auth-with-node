const express = require('express');
const validator = require('validator');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const passport = require('passport');
const router = express.Router();

router.get('/register', (req, res) => {
	res.render('register', { errors: [] });
});

router.post('/register', (req, res) => {
	let errors = [];
	let { email, password, password2 } = req.body;
	if (!email || !password || !password2) {
		errors.push({ msg: 'all fields are required' });
	}
	if (password.length < 6) {
		errors.push({ msg: 'password must have more than 6 characters' });
	}
	if (password !== password2) {
		errors.push({ msg: 'passwords do not matched' });
	}
	//we have error
	if (errors.length) {
		res.render('register', { errors: errors });
	}

	//dont have error
	if (errors.length == 0) {
		bcrypt.hash(password, 10, (err, hash) => {
			const newUser = new User({
				email: email,
				password: hash,
			});
			newUser
				.save()
				.then(() => {
					console.log('user saved to db');
					//res.render('users/login', { msg: 'you are registered succesfully now you can login' });
					req.flash('success_msg', 'you are registered succesfully now you can login');
					res.redirect('/users/login');
				})
				.catch((err) => {
					console.log(err);
					errors.push({ msg: 'user with this email already exists' });
					res.render('register', { errors: errors });
				});
		});
	}
});

router.get('/login', (req, res) => {
	//console.log(req.session);
	res.render('login', { msg: req.flash('success_msg'), err: req.flash('error') });
});

router.post('/login', (req, res, next) => {
	passport.authenticate('local', {
		successRedirect: '/profile',
		failureRedirect: '/users/login',
		failureFlash: true,
	})(req, res, next);
});
module.exports = router;
