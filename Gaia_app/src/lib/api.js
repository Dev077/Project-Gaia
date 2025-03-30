// src/lib/api.js
import axios from 'axios';

// Define base URL for API calls
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Create axios instance
const api = {
  // Tasks endpoints
  getTasks: () => axios.get(`${API_URL}/tasks`),
  updateTask: (taskId, data) => axios.patch(`${API_URL}/tasks/${taskId}`, data),
  
  // Stats endpoints (for Mirror page)
  getUserStats: () => axios.get(`${API_URL}/users/stats`),
  updateStreak: () => axios.post(`${API_URL}/users/update-streak`),
  
  // Carbon endpoints
  calculateCarbonEstimate: (data) => axios.post(`${API_URL}/carbon/carbon-estimate`, data),
  getVehicleMakes: () => axios.get(`${API_URL}/carbon/vehicle-makes`),
  getVehicleModels: (makeId) => axios.get(`${API_URL}/carbon/vehicle-models/${makeId}`)
};

export default api;