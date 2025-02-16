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
}, { 
  _id: false,
  timestamps: true  // Add timestamps to track message order
});

const ChatSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  messages: {
    type: [MessageSchema],
    default: [],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true  // Add timestamps to the chat document
});

// Add a pre-save middleware to update the updatedAt field
ChatSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Chat || mongoose.model('Chat', ChatSchema); 