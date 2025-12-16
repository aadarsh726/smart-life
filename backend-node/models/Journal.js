const mongoose = require('mongoose');

const JournalSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    mood_score: {
        type: Number, // 1-10
        default: 5
    },
    sentiment_label: {
        type: String, // 'Positive', 'Neutral', 'Negative'
        default: 'Neutral'
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Journal', JournalSchema);
