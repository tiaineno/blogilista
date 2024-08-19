const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({}).populate('user', { username: 1, name: 1, id: 1})

  response.json(blogs)
})

blogRouter.post('/', async (request, response) => {
  console.log('idhaiuhdoiuaoiaja', request.user)
    const body = request.body
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    if (!decodedToken.id) {
      return response.status(400).json({ error: 'token invalid' })
    }
    const user = request.user
    body["user"] = user
    const blog = new Blog(body)
    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    response.status(201).json(savedBlog)
    })

blogRouter.delete('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  if (!blog) {
    return response.status(401).json({ error: 'invalid id' })
  }
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }
  const user = request.user
  if ( blog.user.toString() !== user.id.toString() ){
    return response.status(403).json({ error: "not allowed to do that" })
  }
  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

blogRouter.put('/:id', async (request, response) => {
  const body = request.body
  const updated = await Blog.findByIdAndUpdate(request.params.id, {'likes': body.likes}, { new: true })
  response.json(updated)
})

module.exports = blogRouter