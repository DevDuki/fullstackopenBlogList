const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')

beforeEach(async () => {
  await Blog.deleteMany({})

  const blogObjects = helper.initialBlogs
    .map((blog) => new Blog(blog))

  const promiseArray = blogObjects
    .map((blog) => blog.save())

  await Promise.all(promiseArray)
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')

  expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('blogs have a unique identifier id', async () => {
  const response = await api.get('/api/blogs')

  const blogs = response.body

  blogs.forEach((blog) => {
    expect(blog.id).toBeDefined()
  })
})

test('new blog is added correctly', async () => {
  const blog = {
    title: 'new Title',
    author: 'Dookie',
    url: 'some url',
    likes: 10
  }

  await api
    .post('/api/blogs')
    .send(blog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

  const titles = blogsAtEnd.map((blog) => blog.title)
  expect(titles).toContain('new Title')
})

test('new blog with missing likes has 0 likes as default', async () => {
  const blog = {
    title: 'noone likes this blog',
    author: 'sad man',
    url: 'some other url'
  }

  const response = await api
    .post('/api/blogs')
    .send(blog)

  expect(response.body.likes).toBe(0)
})

test('invalid request is handled correctly and not added', async () => {
  const blog = {
    author: 'incomplete blogger'
  }

  await api
    .post('/api/blogs')
    .send(blog)
    .expect(400)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
})



afterAll(() => {
  mongoose.connection.close()
})
