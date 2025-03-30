const mongoose = require('mongoose');

const CarbonEstimateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  estimateType: {
    type: String,
    enum: ['flight', 'vehicle', 'shipping', 'electricity', 'fuel_combustion'],
    required: true
  },
  carbonKg: {
    type: Number,
    required: true
  },
  apiResponse: {
    type: Object,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CarbonEstimate', CarbonEstimateSchema);