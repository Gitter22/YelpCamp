const Campground=require('../models/campgrounds')
const Review=require('../models/reviews')

module.exports.createReview=async(req,res)=>{
    const foundCampground=await Campground.findById(req.params.id)
    const review=new Review(req.body.review)
    review.author=req.user._id
    foundCampground.reviews.push(review)
    await review.save()
    await foundCampground.save() 
    req.flash('success','created new review')
    res.redirect(`/campgrounds/${foundCampground._id}`)
}

module.exports.deleteReview=async (req,res)=>{
    const {id, reviewId}=req.params
    await Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewId}},{useFindAndModify:false})
    await Review.findByIdAndDelete(reviewId)
    req.flash('success','Review deleted')
    res.redirect(`/campgrounds/${id}`)
    }