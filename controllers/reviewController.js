const Review = require('../models/Review');

exports.addReview = async (req, res) => {
    if (!req.body.store) req.body.store = req.params.id;
    if (!req.body.author) req.body.author = req.user._id;
    
    await (new Review(req.body)).save();
    req.flash('success', 'Review Saved!');
    res.redirect('back');
}