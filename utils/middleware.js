const jwt = require('jsonwebtoken')
const User = require('../models/user')

const logger = require('./logger')

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')) {
    return response.status(400).json({ error: 'expected `username` to be unique' })
  } else if (error.name ===  'JsonWebTokenError') {
    return response.status(400).json({ error: 'token missing or invalid' })
  }

  next(error)
}

const tokenExtractor = (request, response, next) => {
  console.log('extracting token')
  const authorization = request.get('authorization')
  console.log('authorized')
  if (authorization && authorization.startsWith('Bearer ')) {
    console.log('checking...')
    request.token = authorization.replace('Bearer ', '')
  }
  console.log('next')
  next()
}

const userExtractor = async (request, response, next) => {
  console.log('extracting user')
  if (request.token){
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    const id = decodedToken.id
    console.log(id)
    request.user = await User.findById(decodedToken.id)
  }
  console.log('next')
  next()
}

module.exports = {
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor
}