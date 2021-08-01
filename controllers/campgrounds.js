const campgrounds = require('../models/campgrounds')
const Campground=require('../models/campgrounds')
const {cloudinary}=require('../cloudinary')
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index=async (req,res)=>{
    const campgrounds=await Campground.find({})
    res.render('campgrounds/index',{campgrounds})
}

module.exports.createCampground=async (req,res)=>{   
    const geoData=await geocoder.forwardGeocode({
        query:req.body.campground.location,
        limit:1
    }).send()
    const campground=new Campground({...req.body.campground})
    campground.geometry=geoData.body.features[0].geometry
    campground.images=req.files.map(f=>({url:f.path,filename:f.filename}))
    campground.author=req.user._id
    await campground.save()
    req.flash('success','Successfully created campground')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.renderNewForm=(req,res)=>{ 
    res.render('campgrounds/new')
}




module.exports.campgroundDetail=async (req,res)=>{
    const campground=await Campground.findById(req.params.id).populate({
            path:'reviews',
            populate: {
                path:'author'
            }
    }).populate('author')
    if(!campground) {
      req.flash('error','Cannot find that campground')
      return res.redirect('/campgrounds')
    }
    res.render('campgrounds/details',{campground})
    }

module.exports.updateCampground=async (req,res)=>{
    const campground=await Campground.findByIdAndUpdate(req.params.id,{...req.body.campground},{useFindAndModify:false, runValidators:true, new:true})
    const geoData=await geocoder.forwardGeocode({
        query:req.body.campground.location,
        limit:1
    }).send()
    campground.geometry=geoData.body.features[0].geometry

    const imgs=req.files.map(f=>({url:f.path,filename:f.filename}))
    campground.images.push(...imgs)
     await campground.save()
    if (req.body.deleteImages) {
        for(let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename)
        }
    await campground.updateOne({$pull:{images:{filename:{$in:req.body.deleteImages}}}})
}
    req.flash('success','Successfully updated campground')
    res.redirect(`/campgrounds/${campground._id}`)
}

    module.exports.deleteCampground = async (req, res) => {
        const { id } = req.params;
        let campground = await Campground.findById(id);
        try {
                for (let image of campground.images) {
                        await cloudinary.uploader.destroy(image.filename);
                }
        } catch(err) {
                req.flash('error', 'Campground images could not be deleted, something went wrong.');
                return res.redirect(`/campgrounds/${id}`);
        }
        await campground.remove();
        req.flash('success', 'Successfully deleted campground')
        res.redirect('/campgrounds');
    }

module.exports.renderEditForm=async (req,res)=>{
    const campground=await Campground.findById(req.params.id)
    if(!campground) {
        req.flash('error','Cannot find that campground')
        return res.redirect('/campgrounds')
      }
    res.render('campgrounds/edit',{campground})
}