require('dotenv').config()
const express = require('express')
const Twitter = require('twitter')
const fetch = require('node-fetch')
const exphbs = require('express-handlebars')

const app = express()

const client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
})

app.use(express.static('public'))

const hbs = exphbs.create({
  defaultLayout: 'main',
  helpers: {
    section: function (name, options) {
      if (!this._sections) this._sections = {}
      this._sections[name] = options.fn(this)
      return null
    },
  },
})

app.engine('handlebars', hbs.engine)
app.set('view engine', 'handlebars')

app.get('/api/youtube/key', (req, res) => {
  res.json({ key: process.env.YOUTUBE_API_KEY })
})

app.get('/api/twitter/:username', (req, res) => {
  client.get(
    'users/show',
    { screen_name: req.params.username },
    (err, tweets, response) => {
      res.json({ followers: JSON.parse(response.body).followers_count })
    }
  )
})

app.get('/api/instagram/:username', async (req, res) => {
  const response = await fetch(
    `https://instagram.com/${req.params.username}/?__a=1&__d=1`
  )
  const data = await response.json()

  res.json({ followers: data.graphql.user.edge_followed_by.count })
})

app.get('/', (req, res) => {
  res.render('index')
})

app.get('/usa', (req, res) => {
  res.render('usa')
})

app.get('/about', (req, res) => {
  res.render('about')
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => console.log(`App started on port ${PORT}`))
