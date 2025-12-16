const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    category: { type: String, enum: ['Work', 'Personal', 'Study', 'Health', 'Other'], default: 'Other' },
    priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
    status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
    deadline: { type: Date },
    completedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);
