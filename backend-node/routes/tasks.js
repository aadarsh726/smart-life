const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');

// @route   GET api/tasks
// @desc    Get all users tasks
router.get('/', auth, async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user.id }).sort({ date: -1 });
        res.json(tasks);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/tasks
// @desc    Add new task
router.post('/', auth, async (req, res) => {
    const { title, category, priority, deadline } = req.body;
    try {
        const newTask = new Task({
            title,
            category,
            priority,
            deadline,
            user: req.user.id
        });
        const task = await newTask.save();
        res.json(task);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/tasks/:id
// @desc    Update task
router.put('/:id', auth, async (req, res) => {
    const { title, category, priority, status, deadline } = req.body;
    const taskFields = {};
    if (title) taskFields.title = title;
    if (category) taskFields.category = category;
    if (priority) taskFields.priority = priority;

    let xpGained = 0;

    if (status) {
        taskFields.status = status;
        if (status === 'Completed') {
            taskFields.completedAt = Date.now();
            xpGained = 50; // Base XP for completing a task
        }
    }
    if (deadline) taskFields.deadline = deadline;

    try {
        let task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ msg: 'Task not found' });
        if (task.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

        // If task was not already completed and is being completed now
        if (status === 'Completed' && task.status !== 'Completed') {
            const User = require('../models/User');
            const user = await User.findById(req.user.id);
            user.xp += xpGained;

            // Level Up Logic (e.g., Level * 100 XP needed)
            if (user.xp >= user.level * 100) {
                user.level += 1;
                user.xp = 0; // Reset XP or carry over? Let's carry over: user.xp -= (user.level-1)*100
            }
            await user.save();
        }

        task = await Task.findByIdAndUpdate(req.params.id, { $set: taskFields }, { new: true });
        res.json(task);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/tasks/:id
// @desc    Delete task
router.delete('/:id', auth, async (req, res) => {
    try {
        let task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ msg: 'Task not found' });
        if (task.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

        await Task.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Task removed' });
    } catch (err) {
        // console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
