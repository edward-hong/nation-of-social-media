require('dotenv').config()
const path = require('path')
const express = require('express')
const Twitter = require('twitter')
const request = require('request')

const app = express()

const client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
})

app.use(express.static('public'))

app.get('/api/youtube/key', (req, res) => {
  res.json({ key: process.env.YOUTUBE_API_KEY })
})

app.get('/api/twitter/:username', (req, res) => {
  client.get(
    'users/show',
    { screen_name: req.params.username },
    (err, tweets, response) => {
      res.json({ followers: JSON.parse(response.body).followers_count })
    },
  )
})

app.get('/api/instagram/:username', (req, res) => {
  // const url = `https://www.instagram.com/${req.params.username}`
  // request.get(url, function (err, response, body) {
  //   if (response.body.indexOf('"edge_followed_by":{"count":') != -1) {
  //     res.json({
  //       followers: parseInt(
  //         response.body.split('"edge_followed_by":{"count":')[1],
  //       ),
  //     })
  //   }
  // })
  const url = `https://www.instagram.com/${req.params.username}/?__a=1`
  request.get(url, function (err, response, body) {
    res.json({
      followers: JSON.parse(response.body).graphql.user.edge_followed_by.count,
    })
  })
})

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: path.join(__dirname, 'public') })
})

app.get('/usa', (req, res) => {
  res.sendFile('usa.html', { root: path.join(__dirname, 'public') })
})

app.get('/about', (req, res) => {
  res.sendFile('about.html', { root: path.join(__dirname, 'public') })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => console.log(`App started on port ${PORT}`))
