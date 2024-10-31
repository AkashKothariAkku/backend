const mongoose = require('mongoose')


const TransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true
  },
  utrNumber: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
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

const Transaction = mongoose.model(
  'transaction',
  TransactionSchema
)

module.exports = Transaction
