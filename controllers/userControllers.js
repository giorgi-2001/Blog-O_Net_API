const User = require('../models/UserModel')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const validator = require('validator')


const createToken = (_id) => {
    return jwt.sign({ _id }, process.env.SECRET, { expiresIn: '12h'})
}


const signup = async (req, res) => {

    const { username, password, roles } = req.body

    try {
        const user = await User.signup(username, password, roles)
        const token = createToken(user._id)
        res.status(200).json({
            username: user.username,
            roles: user.roles,
            token
        })
    } catch (error) {
        res.status(400).json({error: error.message})
    }

}


const login = async (req, res) => {

    const { username, password } = req.body
    
    try {
        const user = await User.login(username, password)
        const token = createToken(user._id)
        res.status(200).json({
            username: user.username,
            roles: user.roles,
            token
        })
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}


const getUser = async (req, res) => {

    const { _id} = req.user
    const user = await User.findById(_id).
        select('username roles liked_blogs liked_comments')

    if (!user) {
        return res.status(404).json({error: 'User was not found'})
    }

    res.status(200).json(user)

}

const updateUser = async (req, res) => {

    const { username, password, roles} = req.body
    const { _id, roles: userRoles } = req.user

    if(!username && !password && !roles && !roles?.length) {
        return res.status(400).json({error: 'Can not recieve empty request'})
    }

    if (roles?.includes('admin')) {
        return res.status(401).json({error: 'You motherfucker!'})
    }

    const user = await User.findById(_id)

    let updatedUser = {}

    if(username) {
        if(user.username === username) {
            return res.status(400).json({error: 'username already in use'})
        }
        const match = await User.findOne({ username })
        if(match) {
            return res.status(400).json({error: 'username already in use'})
        }
        updatedUser.username = username
    }

    if(password) {
        const match = await bcrypt.compare(password, user.password)
        if(match) {
            return res.status(400).json({error: 'passworrd already in use'})
        }
        if(!validator.isStrongPassword(password)) {
            return res.status(400).json({error: 'passworrd is not strong enough'})
        }
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)
        updatedUser.password = hash
    } 
    
    if(roles && roles?.length) {
        if (userRoles.includes('admin')) {
            updatedUser.roles = [...roles, 'admin']
        } else {
            updatedUser.roles = [...roles]
        }
    }
    await user.updateOne(updatedUser)
    res.status(200).json({message: 'User successfuly updated'})    
}


const deleteUser = async(req, res) => {

    const { _id} = req.user

    try {
        const user = await User.findOneAndDelete({ _id })
        res.status(200).json({message: `User - ${user.username}  deleted succesfully`})
    } catch (error) {
        res.status(400).json({error: 'Could not delete the user'})
    }
}

const getAllUsers = async (req, res) => {
    const users = await User.find()
        .select('-password')
        .sort({ createdAt: -1 })
    res.status(200).json(users)
}

const banUser = async (req, res) => {

    const { id } = req.params 

    if(!mongoose.isValidObjectId(id)) {
        return res.status(200).json({error: 'Could not find the user'})
    }

    const user = await User.findById(id)

    if(!user) {
        return res.status(404).json({error: 'Could not find the user'})
    }

    if (user.roles.includes('admin')) {
        return res.status(401).json({error: 'You can not ban Admin'})
    }

    user.status = 'canceled'
    await user.save()
    res.status(200).json({message: `User ${user.username} has been banned`})
}

const unbanUser = async (req, res) => {

    const { id } = req.params 

    if(!mongoose.isValidObjectId(id)) {
        return res.status(200).json({error: 'Could not find the user'})
    }

    try {
        const user = await User.findOneAndUpdate({ _id: id }, { status: 'active'})
        res.status(200).json({message: `User ${user.username} has been unbanned`})
    } catch(error) {
        res.status(404).json({error: 'User could not be unbanned'})
    }
}



module.exports = { signup, login, getUser, updateUser, deleteUser, getAllUsers, banUser, unbanUser }