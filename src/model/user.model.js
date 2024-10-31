const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')


const userSchema = new mongoose.Schema({
  name: {
    type: String
  },
  email: {
    type: String
  },
  password: {
    type: String,
    select: false
  },
  mobileNumber: {
    type: Number
  },
  countryCode: {
    type: String
  },
  role: {
    type: String,
    default: 'user'
  },
  status: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  profileImage: {
    type: String
  },
  walletAmount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  resetPasswordToken: {
    type: String,
    select: false
  },
  resetPasswordExpire: {
    type: Date,
    select: false
  },
  verifyUserToken: {
    type: String,
    select: false
  },
  verifyUserExpire: {
    type: Date,
    select: false
  }
})

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next()
  }

  this.password = await bcrypt.hash(this.password, 10)
})

// JWT TOKEN
userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  })
}

// Generating Verify User Reset Token
userSchema.methods.getVerifyUserToken = async function () {
  // Hashing and adding verifyToken to userSchema
  this.verifyUserToken = '1234'
  this.verifyUserExpire = Date.now() + 15 * 60 * 1000
  this.save()
  return this.verifyUserToken
}

// Compare Password

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password)
}

// Generating Password Reset Token
userSchema.methods.getResetPasswordToken = function () {

  this.resetPasswordToken = '1234'
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000
  this.save()
  return this.resetPasswordToken
}

const User = mongoose.model(
  'user',
  userSchema
)

module.exports = User
