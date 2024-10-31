const mongoose = require('mongoose')


const contestAmountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true
  },
  contestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "contests",
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  sentenceAccuracy: {
    type: Number,
    required: true
  },
  time: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
})

const ContestAmount = mongoose.model(
  'contestamount',
  contestAmountSchema
)

module.exports = ContestAmount
