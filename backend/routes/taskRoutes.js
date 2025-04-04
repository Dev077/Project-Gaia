// Path: backend/routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const User = require('../models/User');

// Get all tasks
router.get('/', async (req, res) => {
  try {
    // Default to getting all tasks (no user filter)
    const tasks = await Task.find();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update task completion status
router.patch('/:taskId', async (req, res) => {
  try {
    const { completed } = req.body;
    const task = await Task.findById(req.params.taskId);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Get the user that owns the task
    const user = await User.findOne();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // If task is now completed
    if (completed && !task.completed) {
      // Add XP to user
      user.weeklyXP += task.xp;
      user.experience += task.xp;
      
      // Add environmental impact
      if (task.carbonSaved > 0) {
        user.carbonSaved += task.carbonSaved;
      }
      
      if (task.plasticSaved > 0) {
        user.plasticSaved += task.plasticSaved;
      }
      
      // Set completion time
      task.completedAt = new Date();
    } 
    // If task is unchecked
    else if (!completed && task.completed) {
      // Remove XP
      user.weeklyXP -= task.xp;
      user.experience -= task.xp;
      
      // Remove environmental impact
      if (task.carbonSaved > 0) {
        user.carbonSaved -= task.carbonSaved;
      }
      
      if (task.plasticSaved > 0) {
        user.plasticSaved -= task.plasticSaved;
      }
      
      // Reset completion time
      task.completedAt = null;
    }
    
    // Check for level up
    if (user.experience >= (user.level + 1) * 1000 && user.level < 10) {
      user.level += 1;
    }
    
    // Check for level down (edge case)
    if (user.experience < user.level * 1000 && user.level > 0) {
      user.level -= 1;
    }
    
    // Update task and user
    task.completed = completed;
    
    await task.save();
    await user.save();
    
    res.json({ task, user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Reset tasks for a new week
router.post('/reset-weekly', async (req, res) => {
  try {
    // Reset all tasks to uncompleted
    await Task.updateMany(
      {},
      { completed: false, completedAt: null }
    );
    
    // Reset user's weekly XP
    await User.updateOne({}, { weeklyXP: 0 });
    
    res.json({ message: 'Weekly tasks reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;