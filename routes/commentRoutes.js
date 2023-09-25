const express = require('express')
const requireAuth = require('../middleware/authorization')
const {
    getComments,
    addComment,
    deleteComment,
    updateComment,
    likeComment
} = require('../controllers/commentControllers')

const router = express.Router()

router.use(requireAuth)

router.get('/:id', getComments)

router.post('/', addComment)

router.delete('/:id', deleteComment)

router.patch('/:id', updateComment)

router.patch('/like/:id', likeComment)


module.exports = router