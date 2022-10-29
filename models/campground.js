const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Review = require('./reviews')
const User = require('./user')

const options = { toJSON: { virtuals: true } } //---> this options let you add virtuals into an instance that has been parse to json or vice versa

const imageSchema = new Schema({ //--> you can set nested schemas. we are doing this to add a new virtual method to the images
    url: String,
    filename: String
})

// with this you can add some parameters after /upload to change how the image gets delivered to us. it's a cloudinary feature.
// with virtual we have access to the method thumbnail and this process doesn't involve the database
imageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200')
})
const campgroundSchema = new Schema({
    title: String,
    price: {
        type: Number,
        min: 0
    },
    images: [imageSchema],
    description: String,
    location: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'], // this is saying that 'point' is the only thing that can go in there
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        },
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }]
}, options)

campgroundSchema.virtual('properties.popupMarkup').get(function () {
    return `<a href="/campgrounds/${this._id}"><h6>${this.title}</h6></a><p>${this.location}</p>`
})

campgroundSchema.post('findOneAndDelete', async function (camp) {
    if (camp) {
        await Review.deleteMany({ _id: { $in: camp.reviews } })

    }
})

module.exports = mongoose.model("Campground", campgroundSchema)
