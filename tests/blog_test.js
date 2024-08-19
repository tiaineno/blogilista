const { test, describe, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')

const api = supertest(app)

describe('validity of notes', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})

    await api
      .post('/api/blogs')
      .send({
        'author': 'jyri',
        "title": "lol",
        "url": "https://github.com/tiaineno/blogilista",
        "likes": 2
      })
      .expect(201)
  })

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('blogs have an "id" key', async () => {
    const response = await api.get('/api/blogs')
    assert('id' in response.body[0])
  })
})

describe('adding notes', () => {
  test('adding notes works properly', async () => {
    const length = (await api.get('/api/blogs')).body.length
    await api
    .post('/api/blogs')
    .send({
      'author': 'jyri',
      "title": "lol",
      "url": "https://github.com/tiaineno/blogilista",
      "likes": 2})
    .expect(201)
    .expect('Content-Type', /application\/json/)
    const length2 = (await api.get('/api/blogs')).body.length
    assert.strictEqual(length+1, length2)
  })

  test('note without likes gets the value of 0', async () => {
    const response = await api
      .post('/api/blogs')
      .send({
        'author': 'jyri',
        "title": "lol",
        "url": "https://github.com/tiaineno/blogilista"})
      .expect(201)
      .expect('Content-Type', /application\/json/)
    assert.deepStrictEqual(response.body.likes,0)
  })

  test('notes without title or url dont get added', async () => {
    const response = await api
      .post('/api/blogs')
      .send({
        'author': 'jyri',
        "url": "https://github.com/tiaineno/blogilista"})
      .expect(400)
    const response2 = await api
      .post('/api/blogs')
      .send({
        'author': 'jyri',
        "title": "doijaoidaoida"})
      .expect(400)
    const response3 = await api
      .post('/api/blogs')
      .send({})
      .expect(400)
  })
})

test('notes get deleted properly', async () => {
  const response = await api
    .post('/api/blogs')
    .send({'author': 'jyri pippuri', 'title': 'jyrin viisaudet', 'url': 'jyripippuri.com'})
  const id = response.body.id
  await api
    .delete(`/api/blogs/${id}`)
    .expect(204)
  const blog = await Blog.findById(id)
  assert.strictEqual(blog, null)
})

test('updating likes of a blog', async () => {
  const newBlogResponse = await api
    .post('/api/blogs')
    .send({'author': 'jyri pippuri', 'title': 'jyrin viisaudet', 'url': 'jyripippuri.com'})
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const id = newBlogResponse.body.id
  const updatedLikes = 10

  const updateResponse = await api
    .put(`/api/blogs/${id}`)
    .send({ likes: updatedLikes })
    .expect(200)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(updateResponse.body.likes, updatedLikes)
})


after(async () => {
  await mongoose.connection.close()
})

test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  assert.strictEqual(result, 1)
})

const listWithZeroBlogs = []

const listWithOneBlog = [
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    __v: 0
  }
]

const listWithMultipleBlogs = [
    {
      _id: "5a422a851b54a676234d17f7",
      title: "React patterns",
      author: "Michael Chan",
      url: "https://reactpatterns.com/",
      likes: 7,
      __v: 0
    },
    {
      _id: "5a422aa71b54a676234d17f8",
      title: "Go To Statement Considered Harmful",
      author: "Edsger W. Dijkstra",
      url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
      likes: 5,
      __v: 0
    },
    {
      _id: "5a422b3a1b54a676234d17f9",
      title: "Canonical string reduction",
      author: "Edsger W. Dijkstra",
      url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
      likes: 12,
      __v: 0
    },
    {
      _id: "5a422b891b54a676234d17fa",
      title: "First class tests",
      author: "Robert C. Martin",
      url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
      likes: 10,
      __v: 0
    },
    {
      _id: "5a422ba71b54a676234d17fb",
      title: "TDD harms architecture",
      author: "Robert C. Martin",
      url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
      likes: 0,
      __v: 0
    },
    {
      _id: "5a422bc61b54a676234d17fc",
      title: "Type wars",
      author: "Robert C. Martin",
      url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
      likes: 2,
      __v: 0
    }  
  ]

describe('total likes', () => {

    test('when list has no blogs the result is 0', () => {
      const result = listHelper.totalLikes(listWithZeroBlogs)
      assert.strictEqual(result, 0)
    })

    test('when list has only one blog equals the likes of that', () => {
        const result = listHelper.totalLikes(listWithOneBlog)
        assert.strictEqual(result, 5)
      })

    test('when list has multiple blogs the result is the sum', () => {
      const result = listHelper.totalLikes(listWithMultipleBlogs)
      assert.strictEqual(result, 36)
    })
  })

describe('most likes', () => {

  test('when the list is empty the result is null', () => {
    const result = listHelper.favoriteBlog(listWithZeroBlogs)
    assert.strictEqual(result, null)
  })

  test('when the list has one blog, the result is that blog', () => {
    const result = listHelper.favoriteBlog(listWithOneBlog)
    assert.strictEqual(result, listWithOneBlog[0])
  })

  test('when the list has multiple blogs, the result is the right one', () => {
    const result = listHelper.favoriteBlog(listWithMultipleBlogs)
    assert.strictEqual(result, listWithMultipleBlogs[2])
  })
})

describe('most blogs per author', () => {

  test('when the list is empty the result is null', () => {
    const result = listHelper.mostBlogs(listWithZeroBlogs)
    assert.strictEqual(result, null)
  })

  test('when the list has one blog, the result is that author', () => {
    const result = listHelper.mostBlogs(listWithOneBlog)
    assert.deepStrictEqual(result, {'author': 'Edsger W. Dijkstra', 'blogs': 1})
  })

  test('when the list has multiple blogs, the result is correct', () => {
    const result = listHelper.mostBlogs(listWithMultipleBlogs)
    assert.deepStrictEqual(result, {'author': 'Robert C. Martin', 'blogs': 3})
  })
})

describe('most likes per author', () => {

  test('when the list is empty the result is null', () => {
    const result = listHelper.mostLikes(listWithZeroBlogs)
    assert.strictEqual(result, null)
  })

  test('when the list has one blog, the result is that author', () => {
    const result = listHelper.mostLikes(listWithOneBlog)
    assert.deepStrictEqual(result, {'author': 'Edsger W. Dijkstra', 'likes': 5})
  })

  test('when the list has multiple blogs, the result is correct', () => {
    const result = listHelper.mostLikes(listWithMultipleBlogs)
    assert.deepStrictEqual(result, {'author': 'Edsger W. Dijkstra', 'likes': 17})
  })
})