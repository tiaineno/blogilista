const mongoose = require('mongoose')
const User = require('../models/user')

const dummy = (blogs) => {
  return 1
}
const totalLikes = (list) => {
  return list.reduce((accum,item) => accum + item.likes, 0)
}
const favoriteBlog = (list) => {
  if (list.length === 0) {
    return null;
  }
  return list.reduce((max, blog) => (blog.likes > max.likes ? blog : max), list[0])
}
const mostBlogs = (list) => {
  if (list.length === 0) {
    return null;
  }

  let results = {};

  for (let i = 0; i < list.length; i++) {
    const author = list[i].author
    if (author in results) {
      results[author] += 1
    } else {
      results[author] = 1
    }
  }

  return Object.keys(results).reduce((max, author) => 
    (results[author] > max.blogs ? {"author": author, "blogs": results[author]} : max), {"author": '', "blogs": 0})
}
const mostLikes = (list) => {
  if (list.length === 0) {
    return null;
  }

  let results = {};

  for (let i = 0; i < list.length; i++) {
    const author = list[i].author
    if (author in results) {
      results[author] += list[i].likes
    } else {
      results[author] = list[i].likes
    }
  }

  return Object.keys(results).reduce((max, author) => 
    (results[author] > max.likes ? {"author": author, "likes": results[author]} : max), {"author": '', "likes": 0})
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

module.exports = {
  dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes, usersInDb
}