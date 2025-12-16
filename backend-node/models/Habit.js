const mongoose = require('mongoose');

const HabitSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    frequency: {
        type: String, // 'daily', 'weekly'
        default: 'daily'
    },
    streak: {
        type: Number,
        default: 0
    },
    completedDates: [{
        type: String // 'YYYY-MM-DD'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Habit', HabitSchema);
