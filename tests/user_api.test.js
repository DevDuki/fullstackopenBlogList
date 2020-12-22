const mongoose = require('mongoose')
const superTest = require('supertest')
const helper = require('./test_helper')
const bcrypt = require('bcrypt')
const app = require('../app')
const api = superTest(app)

const User = require('../models/user')

beforeEach(async () => {
  await User.deleteMany({})

  const userObjects = helper.initialUsers
    .map(async (user) => {
      const saltRounds = 10
      const passwordHash = await bcrypt.hash(user.password, saltRounds)

      return new User({
        name: user.name,
        username: user.username,
        passwordHash
      })
    })

  const promiseArray = userObjects
    .map((user) => user.save())

  await Promise.all(promiseArray)
})

describe('when there is initially some users', () => {
  test('users are returned as json', async () => {
    await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })
  
  test('all users are returned', async () => {
    const response = await api.get('/api/users')

    expect(response.body).toHaveLength(helper.initialUsers.length)
  })
})

describe('addition of a new user', () => {
  test('succeeds with a valid user', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      name: 'test',
      username: 'test',
      password: 'test'
    }

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()

    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(user => user.username)
    expect(usernames).toContain(response.body.username)
  })
  
  test('fails with statuscode 400 if username is shorter than 3 character', async () => {
    const tooShortUsername = {
      name: 'test',
      username: 'te',
      password: 'test'
    }

    await api
      .post('/api/users')
      .send(tooShortUsername)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(helper.initialUsers.length)
  })

  test('fails with statuscode 400 if password is shorter than 3 character', async () => {
    const tooShortPassword = {
      name: 'test',
      username: 'test',
      password: 't'
    }

    await api
      .post('/api/users')
      .send(tooShortPassword)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(helper.initialUsers.length)
  })
  
  test('fails with statuscode 400 if username already exists', async () => {
    const user = {
      name: 'test',
      username: 'root',
      password: 'test'
    }

    await api
      .post('/api/users')
      .send(user)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(helper.initialUsers.length)
  })  
})



afterAll(() => {
  mongoose.connection.close()
})