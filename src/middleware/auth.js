const User = require('../model/user.model')
const ErrorHandler = require('../utils/errorHandler')
const catchAsyncErrors = require('./catchAsyncErrors')
const jwt = require('jsonwebtoken')

exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  console.log(req.headers.cookie.split("=")[1])
  const token = req?.headers?.cookie?.split("=")[1]

  if (!token) {
    return next(new ErrorHandler('Please Login to access this resource', 401))
  }

  const decodedData = jwt.verify(token, process.env.JWT_SECRET)

  req.user = await User.findById(decodedData.id)

  next()
})

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Role: ${req.user.role} is not allowed to access this resource `,
          403
        )
      )
    }
    next()
  }
}
