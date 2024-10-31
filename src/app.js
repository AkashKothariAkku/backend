const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const errorMiddleware = require('./middleware/error')
const user = require('./routes/user.routes')
const admin = require('./routes/admin.routes')
// import imageUrl from './routes/imageRoutes'
// import sitemapFunction from './sitemap'

const compression  = require('compression')
const apicache = require('apicache')
const cookieParser = require('cookie-parser')

const app = express()

app.disable("x-powered-by")

app.use(
  cors({
    credentials: true,
    origin: true,
  })
)

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'max-age=3, must-revalidate')
  res.setHeader('Referrer-Policy', 'origin-when-crossorigin')
  next()
})

app.use(
  compression({
    filter: shouldCompress,
  })
)

function shouldCompress(req, res) {
  if (req.headers['x-no-compression']) {
    // don't compress responses with this request header
    return false
  }
  const cache = apicache.middleware
  app.use(cache('5 minutes'))
  // fallback to standard filter function
  return compression.filter(req, res)
}

app.use(errorMiddleware)
app.use(express.json())
app.use(cookieParser())
app.use(
  bodyParser.json({
    limit: 1024 * 1024 * 20,
    type: 'application/json',
  })
)
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }))

app.use('/api/v1', user, admin)

// app.use('/sitemap.xml', sitemapFunction)

// Define a catch-all route for handling undefined endpoints
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// app.use((err:any, req:any , res:any, next:any) => {
//   console.error(err.stack);
//   res.status(500).json({ error: 'Something went wrong' });
// });

module.exports = app