const express = require('express');
const router = express.Router();
const Leaderboard = require('../models/Leaderboard');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'forgeai-admin-secret-change-me';

// Inline middleware to check for Admin JWT token
const requireAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header is missing' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Bearer token not found' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded && decoded.role === 'admin') {
      req.admin = decoded;
      next();
    } else {
      return res.status(403).json({ message: 'Access denied: Admin privileges required' });
    }
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token', error: error.message });
  }
};

// GET /api/leaderboards - Public
router.get('/', async (req, res) => {
  try {
    const { limit, quizTitle, sort } = req.query;
    const filter = {};
    if (quizTitle) {
      filter.quizTitle = { $regex: new RegExp(quizTitle, 'i') };
    }

    let query = Leaderboard.find(filter);

    // Default sort by highest score first, then quickest timeSpent
    if (sort === 'date') {
      query = query.sort({ date: -1 });
    } else {
      query = query.sort({ score: -1, timeSpent: 1 });
    }

    if (limit) {
      query = query.limit(parseInt(limit, 10));
    }

    const results = await query.exec();
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving leaderboards', error: error.message });
  }
});

// GET /api/leaderboards/:id - Public
router.get('/:id', async (req, res) => {
  try {
    const record = await Leaderboard.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Leaderboard record not found' });
    }
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving leaderboard record', error: error.message });
  }
});

// POST /api/leaderboards - Public (anyone can submit score or create record)
router.post('/', async (req, res) => {
  try {
    const { username, quizTitle, score, timeSpent, date } = req.body;

    if (!username || typeof score === 'undefined') {
      return res.status(400).json({ message: 'Missing required fields: username and score' });
    }

    const newRecord = new Leaderboard({
      username: username.trim(),
      quizTitle: quizTitle ? quizTitle.trim() : 'General Trivia',
      score: Number(score),
      timeSpent: Number(timeSpent) || 0,
      date: date || new Date()
    });

    const savedRecord = await newRecord.save();
    res.status(201).json(savedRecord);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create leaderboard entry', error: error.message });
  }
});

// PUT /api/leaderboards/:id - Requires Admin
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { username, quizTitle, score, timeSpent, date } = req.body;

    const updatedRecord = await Leaderboard.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          username: username ? username.trim() : undefined,
          quizTitle: quizTitle ? quizTitle.trim() : undefined,
          score: typeof score !== 'undefined' ? Number(score) : undefined,
          timeSpent: typeof timeSpent !== 'undefined' ? Number(timeSpent) : undefined,
          date: date || undefined
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedRecord) {
      return res.status(404).json({ message: 'Leaderboard record not found' });
    }

    res.json(updatedRecord);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update leaderboard entry', error: error.message });
  }
});

// DELETE /api/leaderboards/:id - Requires Admin
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const deletedRecord = await Leaderboard.findByIdAndDelete(req.params.id);
    if (!deletedRecord) {
      return res.status(404).json({ message: 'Leaderboard record not found' });
    }
    res.json({ message: 'Leaderboard entry deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting leaderboard entry', error: error.message });
  }
});

module.exports = router;