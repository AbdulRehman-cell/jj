const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const jwt = require('jsonwebtoken');

// Inline Admin Authentication Middleware
const requireAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header is missing' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token is missing' });
    }

    const secret = process.env.ADMIN_JWT_SECRET || 'forgeai-admin-secret-change-me';
    const decoded = jwt.verify(token, secret);
    
    // Attach admin details to request
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired admin token' });
  }
};

// GET /api/questions - List all questions, with optional filtering by quizId
router.get('/', async (req, res) => {
  try {
    const { quizId } = req.query;
    const filter = {};
    if (quizId) {
      filter.quizId = quizId;
    }
    const questions = await Question.find(filter);
    return res.status(200).json(questions);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch questions: ' + error.message });
  }
});

// GET /api/questions/:id - Get a single question
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    return res.status(200).json(question);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch question: ' + error.message });
  }
});

// POST /api/questions - Create a new question (PUBLIC - Admin dashboard or visitor form can post)
router.post('/', async (req, res) => {
  try {
    const { quizId, questionText, options, correctOption, explanation } = req.body;
    
    // Basic validation
    if (!quizId || !questionText || !options || !correctOption) {
      return res.status(400).json({ 
        error: 'Missing required fields: quizId, questionText, options, and correctOption are required' 
      });
    }

    const newQuestion = new Question({
      quizId,
      questionText,
      options, // Stored as a String according to specs (can hold comma-separated values or JSON string)
      correctOption,
      explanation: explanation || ''
    });

    const savedQuestion = await newQuestion.save();
    return res.status(201).json(savedQuestion);
  } catch (error) {
    return res.status(400).json({ error: 'Failed to create question: ' + error.message });
  }
});

// PUT /api/questions/:id - Update an existing question (ADMIN ONLY)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { quizId, questionText, options, correctOption, explanation } = req.body;
    
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    if (quizId !== undefined) question.quizId = quizId;
    if (questionText !== undefined) question.questionText = questionText;
    if (options !== undefined) question.options = options;
    if (correctOption !== undefined) question.correctOption = correctOption;
    if (explanation !== undefined) question.explanation = explanation;

    const updatedQuestion = await question.save();
    return res.status(200).json(updatedQuestion);
  } catch (error) {
    return res.status(400).json({ error: 'Failed to update question: ' + error.message });
  }
});

// DELETE /api/questions/:id - Delete a question (ADMIN ONLY)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    return res.status(200).json({ message: 'Question successfully deleted', id: req.params.id });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete question: ' + error.message });
  }
});

module.exports = router;