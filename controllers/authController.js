const crypto = require('crypto');
const promisify = require('es6-promisify');
const passport = require('passport');
const User = require('../models/User');
const mail = require('../handlers/mail');

exports.login = passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: 'Failed Login!',
    successRedirect: '/',
    successFlash: 'You are now logged in!'
});

exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'You are now logged out! 👋');
    res.redirect('/');
}

exports.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    req.flash('error', 'Oops you must be logged in to do that!');
    res.redirect('/login');
}

exports.forgot = async (req, res) => {
    // See if a user with that email exists
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        req.flash('error', 'No account with that email exists');
        return res.redirect('/login');
    }

    // Set reset tokens and expiry on their account
    user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordExpires = Date.now() + 3600000;   // 1 hr from now
    await user.save();

    // Send them an email with the token
    const resetToken = user.resetPasswordToken;
    const resetURL = `http://${req.headers.host}/account/reset/${resetToken}`;

    try {
        await mail.send({
            user,
            resetURL,
            subject: 'Password Reset',
            filename: 'password-reset'
        });
    } catch (err) {
        req.flash('error', 'There was an error sending the email. Please try again later!');
        res.redirect('/login');
    }

    req.flash('success', `You have been emailed a password reset link.`);
    // redirect to login page
    res.redirect('/login');
}

exports.reset = async (req, res) => {
    const user = await User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) {
        req.flash('error', 'Password reset is invalid or has expired');
        return res.redirect('/login');
    }

    // if there is a user, show the rest password form
    res.render('reset', { title:'Reset your password' });
}

exports.confirmedPassword = (req, res, next) => {
    if (req.body.password === req.body['password-confirm']) {
        return next();  // keep it going
    }
    req.flash('error', 'Passwords do not match');
    res.redirect('back');
}

exports.update = async (req, res) => {
    const user = await User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) {
        req.flash('error', 'Password reset is invalid or has expired');
        return res.redirect('/login');
    }

    const setPassword = promisify(user.setPassword, user);
    await setPassword(req.body.password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    const updatedUser = await user.save();
    await req.login(updatedUser);

    req.flash('success', '💃 Nice! Your password has been reset! You are now logged in!');
    res.redirect('/');
}