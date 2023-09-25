const express = require('express')
const { 
    signup, 
    login, 
    getUser, 
    updateUser, 
    deleteUser,
    getAllUsers,
    banUser,
    unbanUser 
} = require ('../controllers/userControllers')

const requireAuth = require('../middleware/authorization')
const requireAdmin = require('../middleware/requireAdmin')


const router = express.Router()

router.post('/signup', signup)

router.post('/login', login)



router.use(requireAuth)

router.get('/profile', getUser)

router.patch('/profile', updateUser)

router.delete('/profile', deleteUser)



router.use(requireAdmin)

router.get('/', getAllUsers)

router.patch('/ban/:id', banUser)

router.patch('/unban/:id', unbanUser)

module.exports = router