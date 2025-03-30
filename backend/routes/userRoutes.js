// Path: backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Task = require('../models/Task');

// Get user stats (for the Mirror page)
router.get('/stats', async (req, res) => {
  try {
    // Get the first user (we're not doing authentication)
    let user = await User.findOne();
    
    // If no user exists, create a default one
    if (!user) {
      user = new User({
        username: 'EcoUser',
        level: 1,
        experience: 100,
        weeklyXP: 0,
        weeklyXPTarget: 200,
        carbonSaved: 0,
        carbonEmitted: 0,
        plasticSaved: 0,
        streak: 0
      });
      await user.save();
      
      // Create default tasks if no user exists
      const defaultTasks = [
        {
          title: "Use Reusable Products",
          description: "Use reusable bags, containers, and water bottles",
          xp: 30,
          carbonSaved: 0.05,
          plasticSaved: 0.05
        },
        {
          title: "Compost Organic Waste",
          description: "Compost food scraps to reduce landfill waste",
          xp: 35,
          carbonSaved: 0.4
        },
        {
          title: "Save Energy at Home",
          description: "Turn off electric based devices when not in use or not needed",
          xp: 40,
          carbonSaved: 0.3
        },
        {
          title: "Commute sustainably",
          description: "Walk, bike, or use public transport instead of driving alone",
          xp: 45,
          carbonSaved: 8.8
        },
        {
          title: "Eat plant-based meals",
          description: "Have meals without meat or with less meat",
          xp: 50,
          carbonSaved: 6
        }
      ];
      
      await Task.insertMany(defaultTasks);
    }
    
    // Get weekly XP target
    const tasks = await Task.find();
    const totalPossibleXP = tasks.reduce((sum, task) => sum + task.xp, 0);
    
    // Prepare response object
    const userStats = {
      _id: user._id,
      username: user.username,
      level: user.level,
      experience: user.experience,
      weeklyXP: user.weeklyXP,
      weeklyXPTarget: totalPossibleXP,
      weeklyXPPercentage: Math.round((user.weeklyXP / totalPossibleXP) * 100) || 0,
      carbonSaved: user.carbonSaved,
      carbonEmitted: user.carbonEmitted,
      plasticSaved: user.plasticSaved,
      streak: user.streak,
      nextLevelXP: (user.level + 1) * 1000,
      xpToNextLevel: ((user.level + 1) * 1000) - user.experience
    };
    
    res.json(userStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update streak
router.post('/update-streak', async (req, res) => {
  try {
    // Find the first user (we're not doing authentication)
    const user = await User.findOne();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const tasks = await Task.find();
    const allTasksCompleted = tasks.every(task => task.completed);
    
    if (allTasksCompleted) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const lastCompleted = user.lastCompletedDate;
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // If last completed date was yesterday, increment streak
      if (lastCompleted && lastCompleted.getTime() === yesterday.getTime()) {
        user.streak += 1;
      } 
      // If no completion or gap in streak, reset to 1
      else if (!lastCompleted || lastCompleted.getTime() < yesterday.getTime()) {
        user.streak = 1;
      }
      
      user.lastCompletedDate = today;
      await user.save();
    }
    
    res.json({ streak: user.streak });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;