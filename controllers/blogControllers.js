const Blog = require('../models/BlogModel')
const User = require('../models/UserModel')
const Comment = require('../models/CommentModel')
const mongoose = require('mongoose')

const getAllBlogs = async (req, res) => {
    const blogs = await Blog.find().sort({ createdAt: -1 })
    const users = await User.find({ status: 'canceled'}).select('_id')
    
    const bannedUserIds = users.map(user => user._id.toString())

    const filteredBlogs = blogs.filter(blog => !bannedUserIds.includes(blog.user_id))

    res.status(200).json(filteredBlogs)
}

const getMyBlogs = async (req, res) => {
    const { _id } = req.user
    const blogs = await Blog.find({ user_id: _id }).sort({ createdAt: -1 })
    res.status(200).json(blogs)
}


const getLikedBlogs = async (req, res) => {
    const { _id } = req.user
    const user = await User.findById(_id).select('liked_blogs')
    const blogs = await Blog.find().sort({createdAt: -1})

    const likedBlogs = blogs.filter(blog => user.liked_blogs.includes(blog._id))

    res.status(200).json(likedBlogs)
}

const getSingleBlog = async (req, res) => {

    const { id } = req.params

    if (mongoose.isValidObjectId(id)) {
        const blog = await Blog.findById(id)
        res.status(200).json(blog)
    } else {
        res.status(400).json({error: 'No valid ID had been provided'})
    }
    
}


const createBlog = async (req, res) => {

    const { _id, roles } = req.user

    const { title, body, author} = req.body

    if (!roles.includes('writer')){
        return res.status(401).json({error: "Anauthorized Action"})
    }

    try {
        const blog = await Blog.create({ title, body, author, user_id: _id })
        res.status(200).json(blog)
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}



const updateBlog = async (req, res) => {

    const { id } = req.params
    const { _id } = req.user
    const { title, body} = req.body
   
    try {
        const blog = await Blog.findOneAndUpdate({ _id: id, user_id: _id }, { title, body})
        res.status(200).json(blog)
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}


const deleteBlog = async (req, res) => {
    const { id } = req.params
    const { _id } = req.user

    if (mongoose.isValidObjectId(id)) {
        const blog = await Blog.findOneAndDelete({ _id: id, user_id: _id })
        await Comment.deleteMany({blog_id: id})
        res.status(200).json(blog)
    } else {
        res.status(400).json({error: 'No valid ID had been provided'})
    }
}

const likeBlog = async (req, res) => {
    const { id: blogId } = req.params
    const { _id: userId } = req.user

    const blog = await Blog.findById(blogId)
    const user = await User.findById(userId).select('liked_blogs')

    if (!mongoose.isValidObjectId(blogId)) {
        return res.status(400).json({error: 'Invalid blog Id'})
    }

    if (!mongoose.isValidObjectId(userId)) {
        return res.status(400).json({error: 'Invalid user Id'})
    }

    if (user.liked_blogs.includes(blogId)) {

        if(blog.likes === 0) return

        const updatedList = user.liked_blogs.filter(id => id !== blogId)
        user.liked_blogs = updatedList
        await user.save()

        blog.likes = blog.likes - 1
        await blog.save()

        res.status(200).json({message: 'You disliked the Blog'})
    } else {
        const updatedList = [...user.liked_blogs, blogId]
        user.liked_blogs = updatedList
        await user.save()

        blog.likes = blog.likes + 1
        await blog.save()
        res.status(200).json({message: 'You liked the Blog'})
    }  
  
}




module.exports = { getAllBlogs, getSingleBlog, createBlog, updateBlog, deleteBlog, getMyBlogs, likeBlog, getLikedBlogs}