const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: [true, 'Quiz reference (quizId) is required'],
      index: true
    },
    questionText: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true
    },
    options: {
      type: String,
      required: [true, 'Options are required. Please provide them as a JSON string array or comma-separated list.'],
      trim: true,
      default: '[]'
    },
    correctOption: {
      type: String,
      required: [true, 'Correct option is required'],
      trim: true
    },
    explanation: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Question', questionSchema);