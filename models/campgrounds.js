const mongoose=require('mongoose')
const { campgroundSchema } = require('../schemas')
const Schema=mongoose.Schema
const Review=require('./reviews')

const ImageSchema=new Schema({
    url:String,
    filename:String
})

ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload','/upload/w_200')
})

const opts = { toJSON: { virtuals: true } };

const CampgroundsSchema=new Schema({
    name:{
        type:String
    },
    price:{
        type:Number
    },
    description:{
        type:String
    },
    geometry:{
        type:{
            type:String,
            enum:['Point'],
            required:true
        },
        coordinates:{
            type:[Number],
            required:true
        }
    },
    location: String,
    images:[ImageSchema],
    reviews:[{
        type:Schema.Types.ObjectId,
        ref:'Review'
    }],
    author:{
        type:Schema.Types.ObjectId,
        ref:'User'
    }
},opts)

CampgroundsSchema.virtual('properties.popUpMarkup').get(function(){
    return `<strong><a href="/campgrounds/${this._id}">${this.name}</a></strong>
    <p>${this.description.substring(0,20)}...</p>`
})



CampgroundsSchema.post('findOneAndDelete',async function (campground){
    if(campground.reviews.length){
        await Review.deleteMany({_id:{$in:campground.reviews}})
    }
})



module.exports=new mongoose.model('Campground',CampgroundsSchema)
