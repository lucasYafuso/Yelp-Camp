//  MVC it is a way to structure our app and it reffers to models, views and controllers.
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
const express = require("express")
const path = require("path")
const app = express()
const session = require('express-session')
const ejsMate = require('ejs-mate')
const methOver = require("method-override")
const mongoose = require("mongoose")
const ExpressError = require('./utils/ExpressError')
const flash = require('connect-flash')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user')
const campgroundsRoutes = require('./routes/campgrounds')
const reviewsRoutes = require('./routes/reviews')
const usersRoutes = require('./routes/users')
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet')
const MongoStore = require('connect-mongo');

const mongoDBUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017/yelp-camp' //---> to conect to the atlas mongodb

main().catch(err => console.log(err));

async function main() {
    await mongoose.connect(mongoDBUrl)
        .then(console.log("connected to server"))
}



app.engine('ejs', ejsMate)
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))
app.use(express.urlencoded({ extended: true }))
app.use(methOver("_method"))
app.use(express.static(path.join(__dirname, 'public')))//--> to use imgs styling and js stored in the public folder
app.use(mongoSanitize()); //--> to prevent injection. it removes every query with $ or .  

const secret = process.env.SECRET || 'notasupersecret'

//---------------------------- setting up to save the session in mongo instead of the memory
const store = MongoStore.create({
    mongoUrl: mongoDBUrl,
    secret,
    touchAfter: 24 * 60 * 60
})

store.on('error', (err) => {
    console.log('session connection error', err)
})
//----------------------------


// session about
sessionConfig = {
    store,
    name: 'session', //--> to change the name instead of the default connect.sid
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        // Date.now is this day and its in miliseconds the next numbers refers to one week
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true, // security reasons so third party members wont have acces to the information
        // secure: true //--> this code allows the usage of session only in https (http secure) we are commenting this for now
    }
}
app.use(session(sessionConfig))




// this sets up the usage of passport
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())


app.use(flash())
app.use((req, res, next) => {
    // res.locals passes in a variable in all templates. the name of the variables are setted after res.locals
    res.locals.currentUser = req.user //--------------> req.user is a method of passport and contains data from the user in the session. THIS HAS TO BE BELOW PASSPORT'S MIDDLEWARE
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
//This is the array that needs added to
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/djyzdo1lv/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
                "https://source.unsplash.com/random/300x300",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

//  all the middlware should go before this routes
app.use('/campgrounds', campgroundsRoutes)
app.use('/campgrounds/:id/reviews', reviewsRoutes)
app.use('/', usersRoutes)

app.get("/", (req, res) => {
    console.log(req.query)
    res.render("campgrounds/home.ejs")
})


app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'something went wrong'
    res.status(statusCode).render('error', { err })
})

const port = process.env.PORT || 3000 // to use automatically the port of heroku
app.listen(port, () => {
    console.log(`listening on port ${port}`)
})