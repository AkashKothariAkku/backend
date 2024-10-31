// Create Token and saving in cookie

const sendToken = (user, statusCode, res) => {
  const token = user.getJWTToken()

  // options for cookie
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 240 * 60 * 60 * 1000
    ),
    secure: true,
  }

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    user,
    status: statusCode,
    token
  })
}

module.exports = sendToken
