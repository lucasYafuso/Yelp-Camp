const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose')

const userSchema = new Schema({
    email:{
        type:String,
        required: true,
        unique:true
    }
})
userSchema.plugin(passportLocalMongoose) // this ads the username and the password behind the scenes

const User = mongoose.model('User', userSchema)

module.exports=User
