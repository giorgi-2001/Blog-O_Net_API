const Comment = require('../models/CommentModel')
const mongoose = require('mongoose')
const User = require('../models/UserModel')

const getComments = async (req, res) => {
 
    const { id } = req.params

    if(!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ error: 'Invalid object Id' })
    }

    const comments = await Comment.find({ blog_id: id }).sort({ createdAt: -1})
    res.status(200).json(comments)
}

const addComment = async (req, res) => {

    const { blog_id, parent_id, username, text, replyingTo } = req.body

    if (!blog_id || !username || !text) {
        return res.status(400).json({ 
            error: 'You are not allowed to send an empty comment'})
    }

    try {
        const comment = await Comment.create({
            blog_id, parent_id, username, text, replyingTo
        })
        res.status(200).json(comment)
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}


const deleteComment = async (req, res) => {

    const { id } = req.params

    const { _id: userId } = req.user

    if(!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ error: 'Invalid object Id' })
    }

    const user = await User.findById(userId)
    const comment = await Comment.findById(id) 

    if (user.username !== comment.username) {
        return res.status(401).json({error: 'You are not allowed to remove this comment'})
    }

    await comment.deleteOne()
    await Comment.deleteMany({parent_id: id})
    
    res.status(200).json(comment)
}


const updateComment = async (req, res) => {

    const { text } = req.body

    const { id } = req.params

    const { _id: userId } = req.user

    if(!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ error: 'Invalid object Id' })
    }

    if(!text) {
        return res.status(400).json({ error: 'You are not allowed to send an empty comment' })
    }

    const user = await User.findById(userId)
    const comment = await Comment.findById(id)

    if(comment.username !== user.username) {
        return res.status(401).json({error: 'You are not allowed to update this comment'})
    }

    try {
        await comment.updateOne({ text })
        res.status(200).json(comment)
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}


const likeComment = async (req, res) => {

    const { id: commentId } = req.params

    if(!mongoose.isValidObjectId(commentId)) {
        return res.status(400).json({error: 'Invalid comment id'})
    }

    const { _id: userId } = req.user

    if(!mongoose.isValidObjectId(userId)) {
        return res.status(400).json({error: 'Invalid user id'})
    }

    const comment = await Comment.findById(commentId).select('likes')
    const user = await User.findById(userId).select('liked_comments')

    if (!comment || !user) {
        return res.status(404).json({error: 'Unable to find'})
    }

    const liked = user.liked_comments.includes(commentId)

    if (liked) {
        comment.likes = comment.likes -1
        await comment.save()

        const updatedList = user.liked_comments.filter(id => id !== commentId)
        user.liked_comments = updatedList
        await user.save()

        res.status(200).json({message: 'comment disliked'})

    } else {
        comment.likes = comment.likes +1
        await comment.save()

        const updatedList = [...user.liked_comments, commentId]
        user.liked_comments = updatedList
        await user.save()

        res.status(200).json({message: 'comment liked'})
    }
}



module.exports = { addComment, getComments, deleteComment, updateComment, likeComment}