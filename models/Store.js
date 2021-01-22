const mongoose = require('mongoose');
const slug = require('slugs');

const storeSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, 'Please enter a store name!']
    },
    slug: String,
    description: {
        type: String,
        trim: true
    },
    tags: [String],
    location: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: [{
            type: Number,
            required: [true, 'You must supply coordinates!']
        }],
        address: {
            type: String,
            required: [true, 'You must supply an address!']
        }
    },
    photo: String,
    author: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'You must supply an author']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Define our indexes
storeSchema.index({
    name: 'text',
    description: 'text'
});

storeSchema.index({ location: '2dsphere' });

// find reviews where the stores _id property === reviews store property
storeSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'store'
});

storeSchema.pre('save', async function(next) {
    if (!this.isModified('name')) return next();

    this.slug = slug(this.name);

    // find other stores that have a slug of name, name-1, name-2
    const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
    const storeWithSlug = await this.constructor.find({ slug: slugRegEx });

    if (storeWithSlug.length) {
        this.slug = `${this.slug}-${storeWithSlug.length + 1}`;
    }

    next();
});

storeSchema.pre(/^find/, function (next) {
    this.populate('reviews');

    next();
});

storeSchema.statics.getTagsList = function () {
    return this.aggregate([
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]);
}

storeSchema.statics.getTopStores = function () {
    return this.aggregate([
        // Looup stores and populate their reviews
        { $lookup: 
            { 
                from: 'reviews', 
                localField: '_id', 
                foreignField: 'store',
                as: 'reviews'
            } 
        },
        // Filter for only items that have 2 or more reviews
        {
            $match: { 'reviews.1': { $exists: true } }
        },
        // Add the average reviews field($project OR $addFields)
        {
            $addFields: {
                photo: '$$ROOT.photo',
                name: '$$ROOT.name',
                reviews: '$$ROOT.reviews',
                slug: '$$ROOT.slug',
                averageRating: { $avg: '$reviews.rating' }
            }
        },
        // Sort it by our new field, highest reviews first
        { 
            $sort: { averageRating: -1 } 
        },
        // Limit to at most 10
        { 
            $limit: 10 
        }
    ]);
}

// function autopopulate(next) {
//     this.populate('reviews');
//     next();
// }

// storeSchema.pre('find', autopopulate);
// storeSchema.pre('findOne', autopopulate);

const Store = mongoose.model('Store', storeSchema);

module.exports = Store;