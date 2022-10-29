// to validate the data that comes. this is like a second layer of requirements the first one is from the client side html in the form
const BaseJoi = require('joi');

// ----------------------------------------- this whole section of code is to prevent html injection. we are adding a method in joi to do that

const sanitizeHtml = require('sanitize-html'); //----> this package looks for html tags in any text that comes from the browser

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            // this function compares what the browser sent with the output of the same thing, that was passed through sanitize html 
            // if they are equal all fine otherwise means that there was an injection therefore throws an error
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});
//---------------------------------------------

const Joi = BaseJoi.extend(extension)

module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required().max(30).escapeHTML(),
        price: Joi.number().required().min(0),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().max(200).escapeHTML(),
        // image: Joi.string().required(),
    }).required(),
    deleteImages: Joi.array()
})

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML()
    }).required()
})
