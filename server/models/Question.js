const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  interviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interview',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  questionNumber: {
    type: Number,
    required: true
  },
  totalQuestions: {
    type: Number,
    default: 5
  },
  difficulty: {
    type: String,
    default: 'Medium'
  },
  category: {
    type: String,
    default: 'Technical'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Question', questionSchema);
