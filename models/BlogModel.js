const mongoose = require('mongoose')

const Schema = mongoose.Schema

const blogSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    likes: {
        type: Number,
        default: 0
    },

    user_id: {
        type: String,
        required: true
    }

}, { timestamps: true })

module.exports = mongoose.model('Blog', blogSchema)
