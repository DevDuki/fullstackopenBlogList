const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')
const User = require('../models/user')

beforeEach(async () => {
  // Reset blogs
  await Blog.deleteMany({})

  const blogObjects = helper.initialBlogs
    .map((blog) => new Blog(blog))

  const promiseArrayBlogs = blogObjects
    .map((blog) => blog.save())

  await Promise.all(promiseArrayBlogs)

  // Reset users
  await User.deleteMany({})

  helper.initialUsers
    .forEach(async (user) => {
      const saltRounds = 10
      const passwordHash = await bcrypt.hash(user.password, saltRounds)

      const userObject = new User({
        name: user.name,
        username: user.username,
        passwordHash
      })

      await userObject.save()
    })
})

describe('when there is initially some blogs saved', () => {
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
})

describe('viewing a specific blog', () => {
  test('succeeds with a valid id', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToView = blogsAtStart[0]

    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(resultBlog.body).toEqual(blogToView)
  })

  test('fails with statuscode 404 if blog doesnt exist', async () => {
    const validNoneExistingId = await helper.noneExistingId()

    await api
      .get(`/api/blogs/${validNoneExistingId}`)
      .expect(404)
  })
  
  test('fails with statuscode 400 if id is invalid', async () => {
    const invalidId = '123'

    await api
      .get(`/api/blogs/${invalidId}`)
      .expect(400)
  })
  
})

describe('addition of a new blog', () => {
  test('succeeds with valid data and returns a statuscode 201', async () => {
    const blog = {
      title: 'new Title',
      author: 'Dookie',
      url: 'some url',
      likes: 10
    }

    const user = {
      username: 'root',
      password: 'root'
    }

    // const response = await api
    //   .post('/api/login')
    //   .send(user)

    // const token = response.body.token

    // console.log('respone', response.body)

    const token = await helper.getToken(user)
  
    await api
      .post('/api/blogs')
      .send(blog)
      .auth(token, { type: 'bearer' })
      .expect(201)
      .expect('Content-Type', /application\/json/)
  
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
  
    const titles = blogsAtEnd.map((blog) => blog.title)
    expect(titles).toContain('new Title')
  })

  test('with missing likes, adds the blog with the default amount of 0 likes', async () => {
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

  test('fails with statuscode 400 if data is invalid', async () => {
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

  test('fails with statuscode 401 if token is not provided', async () => {
    const blog = {
      title: 'new Title',
      author: 'Dookie',
      url: 'some url',
      likes: 10
    }
  
    await api
      .post('/api/blogs')
      .send(blog)
      .auth('sometokne', { type: 'bearer' })
      .expect(401)
      .expect('Content-Type', /application\/json/)
  })
  
})

describe('deletion of a blog', () => {
  test('succeeds with a valid id', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const removingBlog = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${removingBlog.id}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)
  })

  test('fails with statuscode 400 if id is invalid', async () => {
    const invalidId = '345'

    await api
      .delete(`/api/blogs/${invalidId}`)
      .expect(400)
  })

  test('succeeds if blog doesnt exist', async () => {
    const validNoneExistingId = await helper.noneExistingId()

    await api
      .delete(`/api/blogs/${validNoneExistingId}`)
      .expect(204)
  })  
})

describe('editing a blog', () => {
  test('succeeds with a valid id', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const editedBlog = { ...blogToUpdate, likes: 99 }

    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(editedBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toContainEqual(response.body)

    const updatedBlogFromDb = blogsAtEnd
      .filter((blog) => blog.id === response.body.id)[0]
    expect(updatedBlogFromDb.likes).toBe(99)
  })
  
  test('fails with statuscode 400 if id is invalid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const editedBlog = { ...blogToUpdate, likes: 99 }

    const invalidId = '234'

    await api
      .put(`/api/blogs/${invalidId}`)
      .send(editedBlog)
      .expect(400)
  })
  
  test('fails with statuscode 404 if blog doesnt exist', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const editedBlog = { ...blogToUpdate, likes: 99 }

    const validNoneExistingId = await helper.noneExistingId()

    await api
      .put(`/api/blogs/${validNoneExistingId}`)
      .send(editedBlog)
      .expect(404)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
