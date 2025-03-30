const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  level: {
    type: Number,
    default: 0
  },
  experience: {
    type: Number,
    default: 0
  },
  weeklyXP: {
    type: Number,
    default: 0
  },
  weeklyXPTarget: {
    type: Number,
    default: 1000
  },
  carbonSaved: {
    type: Number,
    default: 0
  },
  carbonEmitted: {
    type: Number,
    default: 0
  },
  plasticSaved: {
    type: Number,
    default: 0
  },
  streak: {
    type: Number,
    default: 0
  },
  lastCompletedDate: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);