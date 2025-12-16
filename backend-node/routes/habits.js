const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Habit = require('../models/Habit');

// @route   GET api/habits
// @desc    Get all habits for user
router.get('/', auth, async (req, res) => {
    try {
        const habits = await Habit.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(habits);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/habits
// @desc    Create a new habit
router.post('/', auth, async (req, res) => {
    try {
        const newHabit = new Habit({
            title: req.body.title,
            user: req.user.id
        });
        const habit = await newHabit.save();
        res.json(habit);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/habits/:id/checkin
// @desc    Mark habit as done for today
router.post('/:id/checkin', auth, async (req, res) => {
    try {
        const habit = await Habit.findById(req.params.id);
        if (!habit) return res.status(404).json({ msg: 'Habit not found' });
        if (habit.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

        const today = new Date().toISOString().split('T')[0];

        // Check if already completed today
        if (habit.completedDates.includes(today)) {
            return res.status(400).json({ msg: 'Habit already completed today' });
        }

        // Logic for Streak
        // Simple version: just increment for now. Ideally check yesterday.
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (habit.completedDates.includes(yesterdayStr)) {
            habit.streak += 1;
        } else {
            // Broken streak or new habit
            habit.streak = 1;
        }

        habit.completedDates.push(today);
        await habit.save();
        res.json(habit);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
