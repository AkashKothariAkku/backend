const app = require('./app')
require('dotenv').config({ path: './config/config.env' })
const connectDatabase = require('../config/dbConnection')

connectDatabase()

const server = app.listen(process.env.PORT, () => {
  console.log('Server is running.')
})

// Unhandled Promise Rejection
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err}`)
  console.log('Shutting down the server due to Unhandled Promise Rejection')

  server.close(() => {
    process.exit(1)
  })
})
