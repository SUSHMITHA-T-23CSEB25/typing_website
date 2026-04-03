const router = require('express').Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Middleware to verify token
const auth = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// Save score
router.post('/score', auth, async (req, res) => {
    try {
        const { wpm } = req.body;
        const user = await User.findById(req.user.id);
        user.scores.push({ wpm });
        await user.save();
        res.json({ message: 'Score saved' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get leaderboard (top 10)
router.get('/leaderboard', async (req, res) => {
    try {
        const users = await User.find().sort({ 'scores.wpm': -1 }).limit(10);
        res.json(users.map(u => ({ name: u.name, topScore: u.scores.length ? Math.max(...u.scores.map(s => s.wpm)) : 0 })));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;