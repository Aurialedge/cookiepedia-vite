import mongoose from 'mongoose';

const channelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  description: {
    type: String,
    maxlength: 200,
    default: ''
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  avatar: {
    type: String,
    default: ''
  },
  coverPhoto: {
    type: String,
    default: ''
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  subscribers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  subscriptionCount: {
    type: Number,
    default: 0
  },
  contentCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  socialLinks: {
    youtube: { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
    tiktok: { type: String, default: '' }
  },
  preferences: {
    privacy: {
      type: String,
      enum: ['public', 'private', 'restricted'],
      default: 'public'
    },
    commentModeration: {
      type: Boolean,
      default: false
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamps on save
channelSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Update subscription count when subscribers array changes
channelSchema.pre('save', function(next) {
  this.subscriptionCount = this.subscribers.length;
  next();
});

// Indexes for better query performance
channelSchema.index({ name: 'text', description: 'text' });
channelSchema.index({ owner: 1 });
channelSchema.index({ 'preferences.privacy': 1 });

const Channel = mongoose.model('Channel', channelSchema);

export default Channel;
