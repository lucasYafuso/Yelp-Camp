const Campground = require("../models/campground.js")
const { cloudinary } = require('../cloudinary')
// here we are requiring the package and and authenticating with the mapbox token 
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const mapboxToken = process.env.MAPBOX_TOKEN
const geocoder = mbxGeocoding({ accessToken: mapboxToken })

module.exports.index = async (req, res) => {
    const { campQuery = false } = req.query
    if (campQuery) {
        const camps = await Campground.find({ title: campQuery.toUpperCase() })
        if (camps.length) {res.render("campgrounds/index", { camps })}
        req.flash('error', 'Could not found that campground')
        res.redirect('/campgrounds')
    }
    const camps = await Campground.find({})
    res.render("campgrounds/index", { camps })
}

module.exports.newCampground = (req, res) => {
    res.render("campgrounds/new")
}

module.exports.showCampground = async (req, res) => {
    const { id } = req.params;
    const foundCamp = await Campground.findById(id)
        .populate({ path: 'reviews', populate: { path: 'author' } }) //-----> to populate an already populated object. in this case populated author from reviews
        .populate('author')
    if (!foundCamp) {
        req.flash('error', "this campground was deleted or doesn't exist")
        res.redirect('/campgrounds')
    } else {
        res.render("campgrounds/show", { foundCamp })
    }
}

module.exports.editForm = async (req, res) => {
    const { id } = req.params
    const foundCamp = await Campground.findById(id)
    if (!foundCamp) {
        req.flash('error', "this campground was deleted or doesn't exist")
        res.redirect('/campgrounds')
    } else {
        res.render("campgrounds/edit.ejs", { foundCamp })
    }
}

module.exports.postCampground = async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location, //---> here goes the name of the place we are looking for
        limit: 1 //---> this is how many results do we want
    }).send()
    const newCampground = new Campground(req.body.campground)
    newCampground.geometry = geoData.body.features[0].geometry //---> saving the geoJason into the new instance
    newCampground.images = req.files.map(f => ({ url: f.path, filename: f.filename })) //--> this moves the url and filename into the images array of the campground
    newCampground.author = req.user._id
    newCampground.title = newCampground.title.toUpperCase()
    await newCampground.save()
    // goes after the creation of the camp in the database, therefore if there is an error it doesn't runs
    req.flash('success', 'successfuly made a new campground')
    res.redirect(`/campgrounds/${newCampground._id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'successfully deleted a campground')
    res.redirect('/campgrounds');
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params
    const foundCamp = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    const images = req.files.map(f => ({ url: f.path, filename: f.filename })) //----> this return a new array but we do not want to push an array into another array that's why we spread it, only want the data
    foundCamp.images.push(...images)
    foundCamp.title = req.body.campground.title.toUpperCase()
    await foundCamp.save()
    const { deleteImages } = req.body
    if (deleteImages) {
        // this deletes the images in cloudinary
        for (let filename of deleteImages) {
            await cloudinary.uploader.destroy(filename)
        }
        await foundCamp.updateOne({ $pull: { images: { filename: { $in: deleteImages } } } }) // ----> this is saying: we want to pull from the images array all images that are in the deleteImages array
    }

    req.flash('success', 'successfuly edited the campground')
    res.redirect(`/campgrounds/${id}`)
}