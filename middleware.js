const { campgroundSchema} = require('./schemaValidation.js');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const {reviewSchema } = require('./schemaValidation')
const Review = require('./models/reviews')


const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

const isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}


const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}

const isReviewAuthor = async(req, res, next)=>{
    const {id, reviewId} = req.params
    const review = await Review.findById(reviewId)
    if(!review.author.equals(req.user._id)){
        req.flash('error', 'you are not the owner of the review')
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}

// extra code due to the 0.6.0 actualization of passport 
const checkReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
}


module.exports.checkReturnTo = checkReturnTo

module.exports.isLoggedIn = isLoggedIn;

module.exports.validateCampground = validateCampground;

module.exports.isAuthor = isAuthor;

module.exports.validateReview = validateReview; 

module.exports.isReviewAuthor = isReviewAuthor; 