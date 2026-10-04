const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const jwt = require('jsonwebtoken');

// Helper to check for Admin JWT token
const requireAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header is missing' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token is missing' });
    }

    const secret = process.env.ADMIN_JWT_SECRET || 'forgeai-admin-secret-change-me';
    const decoded = jwt.verify(token, secret);
    
    // Attach decoded info to request
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired administrator token' });
  }
};

// GET /api/quizzes - PUBLIC
router.get('/', async (req, res) => {
  try {
    const { topic, difficulty, search } = req.query;
    let query = {};

    if (topic && topic !== 'All') {
      query.topic = { $regex: new RegExp(`^${topic}$`, 'i') };
    }
    if (difficulty && difficulty !== 'All') {
      query.difficulty = { $regex: new RegExp(`^${difficulty}$`, 'i') };
    }
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const quizzes = await Quiz.find(query).sort({ _id: -1 });
    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve quizzes', error: error.message });
  }
});

// GET /api/quizzes/:id - PUBLIC
router.get('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    res.status(200).json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve quiz details', error: error.message });
  }
});

// POST /api/quizzes - PUBLIC (Anyone can create)
router.post('/', async (req, res) => {
  try {
    const { title, topic, difficulty, imageUrl, questionsCount } = req.body;

    if (!title || !topic || !difficulty) {
      return res.status(400).json({ message: 'Title, topic, and difficulty are required fields' });
    }

    const newQuiz = new Quiz({
      title,
      topic,
      difficulty,
      imageUrl: imageUrl || 'https://picsum.photos/seed/quiz' + Math.floor(Math.random() * 100) + '/600/400',
      questionsCount: Number(questionsCount) || 0
    });

    const savedQuiz = await newQuiz.save();
    res.status(201).json(savedQuiz);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create quiz', error: error.message });
  }
});

// PUT /api/quizzes/:id - requireAdmin ONLY
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { title, topic, difficulty, imageUrl, questionsCount } = req.body;

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      {
        title,
        topic,
        difficulty,
        imageUrl,
        questionsCount: questionsCount !== undefined ? Number(questionsCount) : undefined
      },
      { new: true, runValidators: true }
    );

    if (!updatedQuiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    res.status(200).json(updatedQuiz);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update quiz', error: error.message });
  }
});

// DELETE /api/quizzes/:id - requireAdmin ONLY
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const deletedQuiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!deletedQuiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    res.status(200).json({ message: 'Quiz deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete quiz', error: error.message });
  }
});

module.exports = router;