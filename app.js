const express = require('express')
const app = express()
const config = require('./utils/config')
require('express-async-errors')
const mongoose = require('mongoose')
const cors = require('cors')
const middleware = require('./utils/middleware')
const blogsRouter = require('./controllers/blogs')
const logger = require('./utils/logger')

const mongoUrl = config.MONGODB_URI

logger.info('connecting to', mongoUrl)

mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch(error => {
    logger.error('error connecting to MongoDB:', error.message)
  })

app.use(cors())
app.use(express.json())
app.use(middleware.requestLogger)

app.use('/api/blogs', blogsRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app