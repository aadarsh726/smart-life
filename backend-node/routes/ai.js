const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const axios = require('axios');

// @route   POST api/ai/chat
// @desc    Simple AI Chat Bot
router.post('/chat', auth, async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user.id;
        const lowerMsg = message.toLowerCase();


        const tasks = await Task.find({ user: userId, status: { $ne: 'Completed' } });

        let botResponse = "I'm not sure I understand. Try asking about your 'tasks', 'priority', or for 'motivation'!";

        if (lowerMsg.includes('task') || lowerMsg.includes('list') || lowerMsg.includes('what')) {
            if (tasks.length === 0) {
                botResponse = "You have no pending tasks. Great job! 🎉";
            } else {
                const limit = 3;
                const topTasks = tasks.slice(0, limit).map(t => `• ${t.title} (${t.priority})`).join('\n');
                botResponse = `You have ${tasks.length} pending tasks. Here are the top ones:\n${topTasks}`;
                if (tasks.length > limit) botResponse += `\n...and ${tasks.length - limit} more.`;
            }
        }
        else if (lowerMsg.includes('priority') || lowerMsg.includes('important') || lowerMsg.includes('first')) {
            const highPriority = tasks.filter(t => t.priority === 'High');
            if (highPriority.length > 0) {
                botResponse = `🚨 Focal Point: **${highPriority[0].title}** is your highest priority right now!`;
            } else if (tasks.length > 0) {
                botResponse = `You don't have any 'High' priority tasks, but you should start with **${tasks[0].title}**.`;
            } else {
                botResponse = "No urgent tasks found. Time to relax? ☕";
            }
        }
        else if (lowerMsg.includes('motivation') || lowerMsg.includes('inspired')) {
            const quotes = [
                "The only way to do great work is to love what you do.",
                "It always seems impossible until it's done.",
                "Don't watch the clock; do what it does. Keep going.",
                "Believe you can and you're halfway there.",
                "Your future is created by what you do today, not tomorrow."
            ];
            botResponse = quotes[Math.floor(Math.random() * quotes.length)] + " 💪";
        }
        else if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
            botResponse = "Hello! I've read your task list. Ask me 'What should I do?' or 'What is my priority?'.";
        }

        res.json({ reply: botResponse });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
