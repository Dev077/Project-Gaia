// Path: backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Task = require('../models/Task');

// Get user profile
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new user
router.post('/', async (req, res) => {
  try {
    const { username } = req.body;
    const user = new User({ username });
    const savedUser = await user.save();
    
    // Create default tasks for the new user
    const defaultTasks = [
      {
        title: "Use Reusable Products",
        description: "Use reusable bags, containers, and water bottles",
        xp: 30,
        carbonSaved: 0.05,
        plasticSaved: 0.05,
        userId: savedUser._id
      },
      {
        title: "Compost Organic Waste",
        description: "Compost food scraps to reduce landfill waste",
        xp: 35,
        carbonSaved: 0.4,
        userId: savedUser._id
      },
      {
        title: "Save Energy at Home",
        description: "Turn off electric based devices when not in use or not needed",
        xp: 40,
        carbonSaved: 0.3,
        userId: savedUser._id
      },
      {
        title: "Commute sustainably",
        description: "Walk, bike, or use public transport instead of driving alone",
        xp: 45,
        carbonSaved: 8.8,
        userId: savedUser._id
      },
      {
        title: "Eat plant-based meals",
        description: "Have meals without meat or with less meat",
        xp: 50,
        carbonSaved: 6,
        userId: savedUser._id
      }
    ];
    
    await Task.insertMany(defaultTasks);
    
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update user stats
router.patch('/:userId', async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      updates,
      { new: true }
    );
    
    // Check if we need to level up
    if (user.experience >= (user.level + 1) * 1000 && user.level < 10) {
      user.level += 1;
      await user.save();
    }
    
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get weekly XP target
router.get('/:userId/weekly-xp', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get all tasks for the user
    const tasks = await Task.find({ userId: user._id });
    const totalPossibleXP = tasks.reduce((sum, task) => sum + task.xp, 0);
    const earnedXP = user.weeklyXP;
    
    res.json({
      weeklyXP: earnedXP,
      weeklyXPTarget: totalPossibleXP,
      percentage: Math.round((earnedXP / totalPossibleXP) * 100)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update streak
router.post('/:userId/update-streak', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const tasks = await Task.find({ userId: user._id });
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