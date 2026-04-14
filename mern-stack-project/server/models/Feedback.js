const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  submissionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission',
    required: true,
  },
  marks: {
    type: Number,
    required: true,
  },
  grade: {
    type: String,
    required: true,
  },
  feedbackText: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Feedback', FeedbackSchema);