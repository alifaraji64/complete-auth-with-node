const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
	email: {
		required: true,
		type: String,
		unique: true,
	},
	password: {
		required: true,
		type: String,
	},
	date: {
		type: Date,
		default: Date.now(),
	},
	resetPasswordToken: String,
	resetPasswordExpires: Date,
});

module.exports = mongoose.model('complete-login', UserSchema);
