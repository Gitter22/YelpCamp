const express=require('express')
const router=express.Router({mergeParams:true})
const Campground=require('../models/campgrounds')
const Review=require('../models/reviews')
const reviews=require('../controllers/reviews')

const wrapAsync=require('../utils/wrapAsync')
const {isLoggedIn, validateReview, isReviewAuthor}=require('../middleware')

    router.post('/', isLoggedIn, validateReview, wrapAsync(reviews.createReview))
    
    router.delete('/:reviewId', isLoggedIn, isReviewAuthor, wrapAsync(reviews.deleteReview))

    module.exports=router