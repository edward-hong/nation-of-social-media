require('dotenv').config()
const path = require('path')
const express = require('express')
const axios = require('axios')

const app = express()

app.use(express.static('public'))

app.get('/api/youtube/key', (req, res) => {
  res.json({ key: process.env.YOUTUBE_API_KEY })
})

app.get('/api/instagram/:username', (req, res) => {
  axios
    .get(`https://www.instagram.com/${req.params.username}/?__a=1`)
    .then(({ data }) => {
      res.json({ followers: data.graphql.user.edge_followed_by.count })
    })
    .catch((error) => {
      res.json({ error })
    })
})

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: path.join(__dirname, 'public') })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => console.log(`App started on port ${PORT}`))
