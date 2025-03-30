// Path: backend/routes/carbonRoutes.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const CarbonEstimate = require('../models/CarbonEstimate');
const User = require('../models/User');

// Carbon Interface API base URL
const API_URL = 'https://www.carboninterface.com/api/v1';

// Helper function for Carbon Interface API requests
const carbonApiRequest = async (endpoint, method = 'GET', data = null) => {
  try {
    const config = {
      method,
      url: `${API_URL}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${process.env.CARBON_INTERFACE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error('Carbon API Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error connecting to Carbon Interface API');
  }
};

// Create a carbon estimate
router.post('/estimate', async (req, res) => {
  try {
    const { userId, ...estimateData } = req.body;
    
    // Get carbon estimate from Carbon Interface API
    const apiResponse = await carbonApiRequest('/estimates', 'POST', estimateData);
    
    // Create a record in our database
    const carbonEstimate = new CarbonEstimate({
      userId,
      estimateType: estimateData.type,
      carbonKg: apiResponse.data.attributes.carbon_kg,
      apiResponse: apiResponse.data
    });
    
    await carbonEstimate.save();
    
    // Update user's carbon emitted
    const user = await User.findById(userId);
    if (user) {
      user.carbonEmitted += apiResponse.data.attributes.carbon_kg;
      await user.save();
    }
    
    res.status(201).json(apiResponse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get vehicle makes
router.get('/vehicle-makes', async (req, res) => {
  try {
    const response = await carbonApiRequest('/vehicle_makes');
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get vehicle models
router.get('/vehicle-models/:makeId', async (req, res) => {
  try {
    const response = await carbonApiRequest(`/vehicle_makes/${req.params.makeId}/vehicle_models`);
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all carbon estimates for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const estimates = await CarbonEstimate.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });
    
    res.json(estimates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;