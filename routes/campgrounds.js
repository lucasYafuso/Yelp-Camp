const express = require('express')
const router = express.Router()
const catchAsync = require('../utils/catchAsync')
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware')
const campgrounds = require('../controllers/campgrounds')
const { storage } = require('../cloudinary') //----> this is associated with out cloudinary account
// multer lets you parse files from a form
const multer = require('multer')
const upload = multer({ storage })

router.route('/') // ------> this lets you group routes under the same path but different verbs
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.postCampground))

// .post(upload.array('image'), (req, res) => { //---> upload.array lets you upload more than one file upload.single 'image' is the name in the form
//     console.log(req.body, req.files) //---> with upload.single it is req.file  
//     res.send('it worked')
// })


router.get("/new", isLoggedIn, campgrounds.newCampground)

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))
    .patch(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground));


router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.editForm))

module.exports = router
