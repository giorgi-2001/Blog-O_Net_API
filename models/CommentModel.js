const mongoose = require('mongoose')

const Schema = mongoose.Schema

const commentSchema = new Schema({
    blog_id: {
        type: String,
        required: true
    },

    parent_id: {
        type: String,
        default: null
    },

    username: {
        type: String,
        required: true
    },

    text: {
        type: String,
        required: true
    },

    replyingTo: {
        type: String,
        default: null
    },

    likes: {
        type: Number,
        default: 0
    }
    
}, { timestamps: true })

module.exports = mongoose.model('Comment', commentSchema)