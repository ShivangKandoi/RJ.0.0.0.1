import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    enum: ['user', 'assistant']
  },
  content: {
    type: String,
    required: true
  },
  complete: {
    type: Boolean,
    default: true
  }
}, { _id: false });

const ChatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  messages: {
    type: [MessageSchema],
    default: []
  }
}, {
  timestamps: true
});

// Add index for better query performance
ChatSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Chat || mongoose.model('Chat', ChatSchema); 