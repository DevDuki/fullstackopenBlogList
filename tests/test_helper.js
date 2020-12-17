const Blog = require('../models/blog')

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

module.exports = {
  initialBlogs, noneExistingId, blogsInDb
}