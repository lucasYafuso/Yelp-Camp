const express = require('express')
//mergeParams to have acces to the id of campground in the app.js file otherwise the req.params doesn't get shared
const router = express.Router({mergeParams:true})
const catchAsync = require('../utils/catchAsync')
const {isLoggedIn, validateReview, isReviewAuthor} = require('../middleware')
const reviews = require('../controllers/reviews')


router.post('/', isLoggedIn,validateReview, catchAsync(reviews.postReview))


router.delete('/:reviewId' , isLoggedIn,isReviewAuthor ,catchAsync(reviews.deleteReview))


module.exports = router