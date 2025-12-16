const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ActivityLog = require('../models/ActivityLog');

// @route   POST api/activities
// @desc    Log a new activity (Meal, Workout, Work)
router.post('/', auth, async (req, res) => {
    const { type, data, date } = req.body;
    try {
        const newActivity = new ActivityLog({
            user: req.user.id,
            type,
            data,
            date: date || Date.now()
        });
        const activity = await newActivity.save();
        res.json(activity);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/activities
// @desc    Get all activities (Optional: filter by type)
router.get('/', auth, async (req, res) => {
    try {
        const { type } = req.query;
        let query = { user: req.user.id };
        if (type) query.type = type;

        const activities = await ActivityLog.find(query).sort({ date: -1 });
        res.json(activities);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
