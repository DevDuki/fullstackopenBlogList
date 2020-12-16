// eslint-disable-next-line no-unused-vars
const dummy = blogs => {
  return 1
}

const totalLikes = blogs => {
  return blogs.reduce((sum, blog) => {
    return sum + blog.likes
  }, 0)
}

const favoriteBlog = blogs => {
  // Getting the index of the blog with most likes, by mapping the blogs into a new array with the numbers of likes
  // and then get the index of the highest number
  const allLikes = blogs.map(blog => blog.likes)
  const index = allLikes.indexOf(Math.max(...allLikes))

  // IIFE used with object deconstruction in order to extract relevant propperties only
  // Note that parentheses are required for returning object literal --,
  const favBlog = (({ title, author, likes }) => ({ title, author, likes }))(blogs[index])
  
  return favBlog
}

const mostBlogs = blogs => {
  const authors = [...new Set(blogs.map(blog => blog.author))]

  const topAuthor = {}

  let amount = 0
  authors.forEach(author => {
    const oldAmount = amount
    amount = blogs
      .filter(blog => blog.author === author)
      .length

    if(amount > oldAmount){
      topAuthor.author = author
      topAuthor.blogs = amount
    }
  })
  return topAuthor
}

const mostLikes = blogs => {
  const authors = [...new Set(blogs.map(blog => blog.author))]

  const topAuthor = {}

  let totalLikes = 0
  authors.forEach(author => {
    const oldTotalLikes = totalLikes
    totalLikes = blogs
      .filter(blog => blog.author === author)
      .reduce((acc, cur) => acc + cur.likes, 0)

    if(totalLikes > oldTotalLikes){
      topAuthor.author = author
      topAuthor.likes = totalLikes
    }
  })
  return topAuthor
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}