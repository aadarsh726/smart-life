const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Journal = require('../models/Journal');
const axios = require('axios');

const ML_SERVICE_URL = 'http://localhost:8000';

// @route   GET api/journal
// @desc    Get all journal entries
router.get('/', auth, async (req, res) => {
    try {
        const entries = await Journal.find({ user: req.user.id }).sort({ date: -1 });
        res.json(entries);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/journal
// @desc    Create entry and analyze sentiment
router.post('/', auth, async (req, res) => {
    try {
        const { content } = req.body;

        // Call Python Service for analysis
        let mood_score = 5;
        let sentiment_label = "Neutral";

        try {
            const mlRes = await axios.post(`${ML_SERVICE_URL}/analyze/sentiment`, { text: content });
            mood_score = mlRes.data.mood_score;
            sentiment_label = mlRes.data.sentiment_label;
        } catch (mlErr) {
            console.error("ML Analysis Failed, defaulting values", mlErr.message);
        }

        const newEntry = new Journal({
            content,
            user: req.user.id,
            mood_score,
            sentiment_label
        });

        const entry = await newEntry.save();
        res.json(entry);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
