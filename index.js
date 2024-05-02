require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()
const bodyParser = require('body-parser')
const dns = require('dns')
const urlParser = require('url')

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))

// Basic Configuration
const port = process.env.PORT || 3000
let urlDatabase = {} // Object to store short URLs

app.use('/public', express.static(`${process.cwd()}/public`))

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html')
})

// POST endpoint to shorten URL
app.post('/api/shorturl', function(req, res) {
  const originalUrl = req.body.url

  // Validate URL format
  const parsedUrl = urlParser.parse(originalUrl)
  if (!parsedUrl.hostname || !parsedUrl.protocol || !['http:', 'https:'].includes(parsedUrl.protocol)) {
    return res.json({ error: 'invalid url' })
  }

  // Check if URL is already shortened
  const existingShortUrl = Object.keys(urlDatabase).find(key => urlDatabase[key] === originalUrl);
  if (existingShortUrl) {
    return res.json({ original_url: originalUrl, short_url: existingShortUrl })
  } else {
    // Generate short URL
    const shortUrl = Object.keys(urlDatabase).length + 1
    urlDatabase[shortUrl] = originalUrl

    res.json({ original_url: originalUrl, short_url: shortUrl })
  }
})

// GET endpoint to redirect shortened URL
app.get('/api/shorturl/:short_url', function(req, res) {
  const shortUrl = req.params.short_url
  const originalUrl = urlDatabase[shortUrl]
  if (originalUrl) {
    res.redirect(originalUrl)
  } else {
    res.json({ error: 'No short URL found for the given input' })
  }
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`)
})