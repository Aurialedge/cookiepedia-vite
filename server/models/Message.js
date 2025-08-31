import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'audio'],
    default: 'text'
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for faster querying
messageSchema.index({ conversationId: 1, createdAt: 1 });

// Virtual for message URL (if needed for media)
messageSchema.virtual('url').get(function() {
  if (this.type !== 'text') {
    return `/uploads/messages/${this._id}.${this.type === 'image' ? 'jpg' : this.type}`;
  }
  return null;
});

const Message = mongoose.model('Message', messageSchema);

export default Message;
