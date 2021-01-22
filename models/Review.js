const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    text: {
        type: String,
        required: [true, 'Your review must have text!']
    },
    rating: {
        type: Number,
        min: [1, 'Rating must not be below 1.0'],
        max: [5, 'Rating must not be above 5.0']
    },
    store: {
        type: mongoose.Types.ObjectId,
        ref: 'Store',
        required: [true, 'You must supply a store!']
    },
    author: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'You must supply an author!']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

reviewSchema.pre(/^find/, function (next) {
    this.populate('author');

    next();
});

// function autopopulate(next) {
//     this.populate('author');
//     next();
// }

// reviewSchema.pre('find', autopopulate);
// reviewSchema.pre('findOne', autopopulate);

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;