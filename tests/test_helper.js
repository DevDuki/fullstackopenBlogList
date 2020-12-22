const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const initialBlogs = [
  {
    title: 'not this',
    author: 'DevDuki',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 3
  },
  {
    title: 'thats right',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5
  },
  {
    title: 'also not this',
    author: 'DevDuki',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 2
  },
  {
    title: 'also not this',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 2
  }
]

const initialUsers = [
  {
    name: 'test user',
    username: 'root',
    password: '1234'
  }
]

const noneExistingId = async () => {
  const blog = new Blog({ title: 'willremovethissoon', author: 'nobody', url: 'someurl', likes: 99 })
  await blog.save()
  await blog.remove()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map((blog) => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map((user) => user.toJSON())
}

const getToken = async () => {
  const userFromDb = await usersInDb()
  console.log('user', userFromDb)

  const userForToken = {
    username: userFromDb.username,
    id: userFromDb._id
  }

  return jwt.sign(userForToken, process.env.SECRET)
}

module.exports = {
  noneExistingId, 
  initialBlogs, blogsInDb,
  initialUsers, usersInDb,
  getToken
}