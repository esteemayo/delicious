const mongoose = require('mongoose');
const validator = require('validator');
const md5 = require('md5');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        validate: [validator.isEmail, 'Invalid Email Address'],
        required: [true, 'Please supply an email address']
    },
    name: {
        type: String,
        required: [true, 'Please supply a name'],
        trim: true
    },
    hearts: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'Store'
        }
    ],
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

userSchema.virtual('gravatar').get(function () {
    const hash = md5(this.email);
    return `https://gravatar.com/avatar/${hash}?s=200`;
});

userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });
userSchema.plugin(mongodbErrorHandler);

const User = mongoose.model('User', userSchema);

module.exports = User;