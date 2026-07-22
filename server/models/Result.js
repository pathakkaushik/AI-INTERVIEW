const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  interviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interview',
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  overallScore: {
    type: Number,
    default: 0
  },
  percentile: {
    type: String,
    default: ''
  },
  timelineMarkers: [
    {
      position: Number,
      type: {
        type: String,
        enum: ['good', 'bad', 'neutral']
      },
      label: String
    }
  ],
  strengths: [
    {
      category: String,
      detail: String
    }
  ],
  improvements: [
    {
      category: String,
      detail: String
    }
  ],
  evaluationTransparency: {
    wordsAnalyzed: {
      type: Number,
      default: 0
    },
    facialExpressions: {
      type: Number,
      default: 0
    },
    keywordClusters: {
      type: Number,
      default: 0
    },
    weighting: {
      technicalAccuracy: {
        type: Number,
        default: 50
      },
      communicationClarity: {
        type: Number,
        default: 30
      },
      confidenceDelivery: {
        type: Number,
        default: 20
      }
    }
  },
  skillRadarData: [
    {
      subject: String,
      candidateScore: Number,
      benchmarkScore: Number,
      fullMark: {
        type: Number,
        default: 150
      }
    }
  ],
  recruiterView: {
    technicalSkills: {
      type: Number,
      default: 0
    },
    communication: {
      type: Number,
      default: 0
    },
    confidence: {
      type: Number,
      default: 0
    },
    hireSuggestion: {
      type: String,
      default: ''
    },
    aiInsights: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Result', resultSchema);
