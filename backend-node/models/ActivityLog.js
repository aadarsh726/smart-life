const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['MEAL', 'WORKOUT', 'WORK_SESSION'], required: true },
    data: { type: Object, required: true }, // Flexible schema for different activities
    date: { type: Date, default: Date.now }
}, { timestamps: true });

// Data Structure Examples:
// MEAL: { name: 'Lunch', calories: 600, macros: { p: 20, c: 50, f: 15 } }
// WORKOUT: { type: 'Running', duration: 30, caloriesBurned: 300 }
// WORK_SESSION: { duration: 120, focusScore: 8, output: 'Coding' }

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
