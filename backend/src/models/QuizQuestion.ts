import mongoose from 'mongoose';

const quizQuestionSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    required: true,
  },
  correctAnswer: {
    type: String,
    required: true,
  },
  explanation: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

export const QuizQuestion = mongoose.model('QuizQuestion', quizQuestionSchema);
