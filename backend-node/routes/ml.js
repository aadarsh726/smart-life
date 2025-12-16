const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../middleware/auth');

// ML Service URL
const ML_SERVICE_URL = 'http://localhost:8000';

// @route   POST api/ml/predict-productivity
// @desc    Get productivity prediction
router.post('/predict-productivity', auth, async (req, res) => {
    try {
        // In a real app, we would fetch user data from DB here and pass it to Python
        // For now, we forward the request body or mock data
        const response = await axios.post(`${ML_SERVICE_URL}/predict/productivity`, req.body);
        res.json(response.data);
    } catch (err) {
        console.error('ML Service Error:', err.message);
        if (err.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            return res.status(err.response.status).json(err.response.data);
        }
        res.status(500).json({ msg: 'ML Service Unavailable', error: err.message });
    }
});

// @route   POST api/ml/predict-task-completion
// @desc    Get task completion probability
router.post('/predict-task-completion', auth, async (req, res) => {
    try {
        const response = await axios.post(`${ML_SERVICE_URL}/predict/task_completion`, req.body);
        res.json(response.data);
    } catch (err) {
        console.error('ML Service Error:', err.message);
        res.status(500).json({ msg: 'ML Service Unavailable' });
    }
});

// @route   POST api/ml/optimize-schedule
// @desc    Get AI optimized schedule
router.post('/optimize-schedule', auth, async (req, res) => {
    try {
        // Forward tasks to Python ML Engine
        const response = await axios.post(`${ML_SERVICE_URL}/optimize/schedule`, req.body);
        res.json(response.data);
    } catch (err) {
        console.error('ML Service Error:', err.message);
        res.status(500).json({ msg: 'ML Service Unavailable' });
    }
});

module.exports = router;
