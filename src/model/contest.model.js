const mongoose = require('mongoose')


const contestSchema = new mongoose.Schema({
  winnerAmount: {
    type: Number,
    required: true
  },
  maxAmount: {
    type: Number,
    required: true
  },
  peopleCount: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  winnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
  sentence: {
    type: String,
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

const Contest = mongoose.model(
  'contest',
  contestSchema
)

module.exports = Contest
