const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  xp: {
    type: Number,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  carbonSaved: {
    type: Number,
    default: 0 // in kg
  },
  plasticSaved: {
    type: Number,
    default: 0 // in kg
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model('Task', TaskSchema);