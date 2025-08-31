import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    validate: [arrayLimit, 'A conversation must have between 2 and 10 participants']
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  isGroup: {
    type: Boolean,
    default: false
  },
  groupName: {
    type: String,
    trim: true
  },
  groupPhoto: {
    type: String
  },
  groupAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  deletedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    deletedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Custom validator for participants array
function arrayLimit(val) {
  return val.length >= 2 && val.length <= 10;
}

// Indexes for faster querying
conversationSchema.index({ participants: 1, updatedAt: -1 });
conversationSchema.index({ 'participants.user': 1, updatedAt: -1 });

// Virtual for unread messages count
conversationSchema.virtual('unreadCount', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'conversationId',
  count: true,
  match: { readBy: { $ne: null } }
});

// Pre-save hook to ensure participants are unique
conversationSchema.pre('save', function(next) {
  if (this.participants && this.participants.length >= 2) {
    const uniqueParticipants = [...new Set(this.participants.map(p => p.toString()))];
    this.participants = uniqueParticipants;
  }
  next();
});

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
