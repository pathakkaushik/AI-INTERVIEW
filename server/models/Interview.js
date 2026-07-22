const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: ''
  },
  personality: {
    type: String,
    enum: ['Friendly', 'Strict', 'HR-like', 'Technical Expert'],
    default: 'Friendly'
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  resumeText: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['setup', 'active', 'completed'],
    default: 'setup'
  },
  score: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number,
    default: 0
  },
  totalQuestions: {
    type: Number,
    default: 20
  },
  currentQuestion: {
    type: Number,
    default: 0
  },
  answers: [
    {
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
      },
      answerText: String,
      score: Number,
      analysis: {
        keywordsDetected: [String],
        missingConcepts: [String],
        suggestedImprovement: String
      }
    }
  ],
  bodyLanguageMetrics: {
    eyeContact: {
      type: Number,
      default: 0
    },
    stability: {
      type: Number,
      default: 0
    },
    nervousTics: {
      type: String,
      default: 'Low'
    }
  },
  cognitiveLoadAvg: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date
});

module.exports = mongoose.model('Interview', interviewSchema);
