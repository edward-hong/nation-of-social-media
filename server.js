require('dotenv').config()
const path = require('path')
const express = require('express')

const app = express()

app.use(express.static('public'))

app.get('/api/youtube/key', (req, res) => {
  res.json({ key: process.env.YOUTUBE_API_KEY })
})

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: path.join(__dirname, 'public') })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => console.log(`App started on port ${PORT}`))
