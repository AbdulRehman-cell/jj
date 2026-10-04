const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Quiz title is required'],
      trim: true,
    },
    topic: {
      type: String,
      required: [true, 'Quiz topic is required'],
      trim: true,
    },
    difficulty: {
      type: String,
      required: [true, 'Quiz difficulty is required'],
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    imageUrl: {
      type: String,
      required: [true, 'Quiz cover image URL is required'],
      default: 'https://picsum.photos/seed/quizdefault/600/400',
    },
    questionsCount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast lookup/filtering by topic or difficulty
quizSchema.index({ topic: 1 });
quizSchema.index({ difficulty: 1 });

module.exports = mongoose.model('Quiz', quizSchema);