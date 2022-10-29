const User = require('../models/user')

module.exports.registerForm = (req, res) => {
    res.render('users/register')
}
module.exports.registerUser = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ username, email })
        const registerUser = await User.register(user, password)
        // to login a user after registers it needs a callback function
        req.login(registerUser, (err) => {
            if (err){ return next(err)}
            req.flash('success', 'successfully registered')
            res.redirect('/campgrounds')
        })

    } catch (e) {
        req.flash('error', e.message)
        res.redirect('/register')
    }

}

module.exports.loginForm = (req, res) => {
    res.render('users/login')
}
module.exports.login = (req, res) => {
    const returnTo = res.locals.returnTo || '/campgrounds'
    req.flash('success', 'logged in')
    res.redirect(returnTo)
}


module.exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        req.flash('success', "Goodbye!");
        res.redirect('/campgrounds');
    });
}
