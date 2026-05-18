import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
}, { _id: false, timestamps: false });

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  materialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudyMaterial',
    required: true,
  },
  messages: {
    type: [messageSchema],
    default: [],
  },
}, {
  timestamps: true,
});

// One chat thread per user per material
chatSchema.index({ userId: 1, materialId: 1 }, { unique: true });

export const Chat = mongoose.models.Chat || mongoose.model('Chat', chatSchema);
