const mongoose = require('mongoose')


const BankAccountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true
  },
  name: {
    type: String,
    required: true
  },
  accountNumber: {
    type: Number,
    required: true
  },
  bankName: {
    type: String,
    required: true
  },
  branchName: {
    type: String,
    required: true
  },
  ifscCode: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: "active"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
})

const BankAccount = mongoose.model(
  'bankaccount',
  BankAccountSchema
)

module.exports = BankAccount
