const Review = require('../models/reviews')
const Campground = require("../models/campground.js")


module.exports.postReview = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    const { rating, body } = req.body.review;
    const review = new Review({ rating, body })
    review.author = req.user._id
    campground.reviews.push(review);
    await campground.save()
    await review.save()
    req.flash('success', 'successfully posted a review')
    res.redirect(`/campgrounds/${id}`)
}

module.exports.deleteReview = async(req, res)=>{
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews:reviewId}})
    const review = await Review.findByIdAndDelete(reviewId)
    req.flash('success', 'successfully deleted a review')
    res.redirect(`/campgrounds/${id}`)
}