import mongoose from 'mongoose';

const reelSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  videoUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String,
    required: true
  },
  caption: {
    type: String,
    trim: true,
    maxlength: 2200
  },
  music: {
    type: String,
    trim: true
  },
  duration: {
    type: Number, // in seconds
    required: true
  },
  aspectRatio: {
    type: String, // e.g., '9:16', '1:1', '16:9'
    default: '9:16'
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likeCount: {
    type: Number,
    default: 0
  },
  commentCount: {
    type: Number,
    default: 0
  },
  shareCount: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  isCommentsDisabled: {
    type: Boolean,
    default: false
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    },
    name: String
  },
  hashtags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // For future features
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  // Privacy settings
  privacy: {
    type: String,
    enum: ['public', 'followers', 'private'],
    default: 'public'
  },
  // For duet/stitch functionality
  originalReel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reel'
  },
  isDuet: {
    type: Boolean,
    default: false
  },
  // For scheduled posts
  scheduledAt: {
    type: Date
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  // For analytics
  engagementRate: {
    type: Number,
    default: 0
  },
  // For content moderation
  isFlagged: {
    type: Boolean,
    default: false
  },
  flags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // For content organization
  collections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection'
  }],
  // For content discovery
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
reelSchema.index({ user: 1, createdAt: -1 });
reelSchema.index({ likes: 1 });
reelSchema.index({ hashtags: 1 });
reelSchema.index({ createdAt: -1 });
reelSchema.index({ likeCount: -1 });
reelSchema.index({ 'location.coordinates': '2dsphere' });

// Virtual for comments
reelSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'reel',
  justOne: false
});

// Virtual for user who liked
reelSchema.virtual('likedBy', {
  ref: 'User',
  localField: 'likes',
  foreignField: '_id',
  justOne: false
});

// Update like count when likes array changes
reelSchema.pre('save', function(next) {
  if (this.isModified('likes')) {
    this.likeCount = this.likes.length;
  }
  
  // Extract hashtags from caption
  if (this.isModified('caption') && this.caption) {
    const hashtagRegex = /#\w+/g;
    this.hashtags = this.caption.match(hashtagRegex) || [];
  }
  
  next();
});

// Handle cascading deletes
reelSchema.pre('remove', async function(next) {
  // Remove all comments associated with this reel
  await this.model('Comment').deleteMany({ reel: this._id });
  
  // Remove from user's reels array
  await this.model('User').updateMany(
    { reels: this._id },
    { $pull: { reels: this._id } }
  );
  
  // Remove from any collections
  await this.model('Collection').updateMany(
    { reels: this._id },
    { $pull: { reels: this._id } }
  );
  
  next();
});

// Static method to get feed
reelSchema.statics.getFeed = async function(userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  // Get users that the current user is following
  const user = await this.model('User').findById(userId).select('following');
  const following = user.following;
  
  // Get reels from followed users and the user themselves
  return this.find({
    $or: [
      { user: { $in: following } },
      { user: userId }
    ],
    isPublished: true,
    isArchived: false
  })
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .populate('user', 'username avatar')
  .lean();
};

const Reel = mongoose.model('Reel', reelSchema);

export default Reel;
