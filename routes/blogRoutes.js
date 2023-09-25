const express = require('express')
const requireAuth = require('../middleware/authorization')
const {
    getAllBlogs,
    getSingleBlog,
    createBlog,
    updateBlog,
    deleteBlog,
    getMyBlogs,
    likeBlog,
    getLikedBlogs
} = require('../controllers/blogControllers')

const router = express.Router()


router.use(requireAuth)

router.get('/', getAllBlogs)

router.get('/myblogs', getMyBlogs)

router.get('/liked', getLikedBlogs)

router.get('/:id', getSingleBlog)

router.post('/', createBlog)

router.patch('/:id', updateBlog)

router.delete('/:id', deleteBlog)

router.patch('/like/:id', likeBlog)

module.exports = router