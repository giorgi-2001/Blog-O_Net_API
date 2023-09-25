const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')

const Schema = mongoose.Schema

const userSchema = new Schema({

    username: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true,
    },

    roles: {
        type: Array,
        required: true,
        Default: ['viewer']
    },

    status: {
        type: String,
        required: true,
        default: 'active'
    },

    liked_blogs: {
        type: Array,
        default: []
    },
    liked_comments: {
        type: Array,
        default: []
    }
})


userSchema.statics.signup = async function (username, password, roles) {

    if (!username || !password || !roles || !roles.length) {
        throw Error('All fields must be filled')
    }

    const exists = await this.findOne({ username })

    if (exists) {
        throw Error('Username already in use')
    }

    if (!validator.isStrongPassword(password)) {
        throw Error('Password is not strong enough')
    }

    if (!Array.isArray(roles)) {
        throw Error('Roles must be formated as an Array')
    }

    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    const  user = await this.create({ username, password: hash, roles})

    return user

}


userSchema.statics.login = async function (username, password) {
    
    if (!username || !password) {
        throw Error('All fields must be filled')
    }

    const user = await this.findOne({ username })

    if(!user) {
        throw Error ('Incorrect username')
    }

    if(user.status === 'canceled') {
        throw Error ('Your account has been banned')
    }

    const match = await bcrypt.compare(password, user.password)

    if (!match) {
        throw Error ('Incorrect password')
    }

    return user

}



module.exports = mongoose.model('User', userSchema)