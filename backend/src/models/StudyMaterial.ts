import mongoose from 'mongoose';

const studyMaterialSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  extractedText: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

export const StudyMaterial = mongoose.model('StudyMaterial', studyMaterialSchema);
