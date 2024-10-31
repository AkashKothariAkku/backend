const mongoose = require('mongoose')


const WithdrawalAmount = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  accountNumberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "bankaccounts",
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: "pending"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
})

const WithdrawAmount = mongoose.model(
  'withdrawamount',
  WithdrawalAmount
)

module.exports = WithdrawAmount
