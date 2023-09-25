require('dotenv').config()
const mongoose = require('mongoose')
const express = require('express')

const blogRoutes = require('./routes/blogRoutes')
const userRoutes = require('./routes/userRoutes')
const commentRoutes = require('./routes/commentRoutes')


port = process.env.PORT || 4000

const app = express()


app.use(express.json())

app.use((req, res, next) => {
    console.log(req.path, req.method)
    next()
})

app.use('/api/blogs', blogRoutes)

app.use('/api/users', userRoutes)

app.use('/api/comments', commentRoutes)

app.use('*', express.static('public'))


mongoose.connect(process.env.MONGO_URL)
    .then (() => {
        app.listen(port, console.log(`server started on port - ${port}, connected to MongoDB`))
    })
