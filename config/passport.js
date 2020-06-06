const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const bcrypt = require('bcrypt');

module.exports = function (passport) {
	passport.use(
		new LocalStrategy({ usernameField: 'email' }, function (email, password, done) {
			User.findOne({ email: email }, (err, user) => {
				if (err) {
					throw err;
				}
				if (!user) {
					return done(null, false, { message: 'incorrect email' });
				}

				bcrypt.compare(password, user.password, (err, result) => {
					if (result) {
						return done(null, user);
					} else {
						console.log('hey hey');
						return done(null, false, { message: ' incorrect password' });
					}
				});
			});
		})
	);

	passport.serializeUser(function (user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function (id, done) {
		User.findById(id, function (err, user) {
			done(err, user);
		});
	});
};
