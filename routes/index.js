const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const async = require('async');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
router.get('/profile', checkAuth, (req, res) => {
	res.render('profile');
});
function checkAuth(req, res, next) {
	req.isAuthenticated() ? next() : res.redirect('/users/login');
}

//logout
router.get('/logout', (req, res) => {
	//console.log(req.session);
	req.session.destroy();
	req.logOut();
	res.redirect('/users/login');
});

//password reset handle
router.get('/forgot', (req, res) => {
	res.render('forgot');
});

router.post('/forgot', function (req, res, next) {
	async.waterfall(
		[
			function (done) {
				crypto.randomBytes(20, function (err, buf) {
					var token = buf.toString('hex');
					done(err, token);
				});
			},
			function (token, done) {
				User.findOne({ email: req.body.email }, function (err, user) {
					if (!user) {
						req.flash('error_reset', 'No account with that email address exists.');
						return res.render('forgot', { error_reset: req.flash('error_reset') });
					}

					user.resetPasswordToken = token;
					user.resetPasswordExpires = Date.now() + (60 * 60 * 1000) / 2; // half an hour

					user.save(function (err) {
						done(err, token, user);
					});
				});
			},
			function (token, user, done) {
				var smtpTransport = nodemailer.createTransport({
					service: 'Gmail',
					auth: {
						user: 'YOUR GMAIL',
						pass: 'PASSWORD OF YOUR GMAIL',
					},
				});
				var mailOptions = {
					to: user.email,
					from: 'YOUR EMAIL',
					subject: 'Password Reset',
					html: `
					<h4>hello from ${req.headers.host}</h4>
					<h5>click the link below to reset your password</h5>
					<a href=${req.headers.origin}/reset/${token} target="_blank">click to reset</a>
					`,
				};
				smtpTransport.sendMail(mailOptions, function (err) {
					console.log('mail sent');
					req.flash(
						'success_reset',
						'An e-mail has been sent to ' + user.email + ' with further instructions.'
					);
					done(err, 'done');
				});
			},
		],
		function (err) {
			if (err) return next(err);
			res.render('forgot', { success_reset: req.flash('success_reset') });
		}
	);
});
//when user clicks to the link in email
router.get('/reset/:token', (req, res) => {
	User.findOne({ resetPasswordToken: req.params.token }, (err, user) => {
		if (err) throw err;
		else if (!user) {
			res.redirect('/users/login');
		} else {
			//the link that user clicked is rellevant
			console.log(user.email);
			let d = new Date(user.resetPasswordExpires);
			if (new Date() < d) {
				console.log('link is rellevant ' + d);
				res.render('reset', { email: user.email });
			} else {
				console.log('link is irrelevant');

				res.redirect('/forgot');
			}
		}
	});
});

//when user enters new password
router.post('/reset/:token', (req, res) => {
	let { password1, password2 } = req.body;
	let reset_errors = [];
	if (!password1 || !password2) {
		reset_errors.push({ msg: 'please enter a valid email' });
	}
	if (password1.length < 6) {
		reset_errors.push({ msg: 'password must contain at least 6 characters' });
	}
	if (password1 !== password2) {
		reset_errors.push({ msg: 'passwords do not match' });
	}
	//we have error
	if (reset_errors.length) {
		res.render('reset', { errors: reset_errors });
	}
	// recieved passwords are completely valid so we can hash and save them
	else {
		bcrypt.hash(password1, 10, (err, hash) => {
			if (err) throw err;
			User.update({ resetPasswordToken: req.params.token }, { $set: { password: hash } }).then(() => {
				req.flash('successfull_reset', 'you can login with your new password');
				res.redirect('/users/login');
				res.send('hello');
			});
		});
	}
});

module.exports = router;
//
