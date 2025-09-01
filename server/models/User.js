import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_.-]+$/, 'Username can only contain letters, numbers, dots, underscores and hyphens']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please use a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false
  },
  name: {
    type: String,
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  bio: {
    type: String,
    maxlength: [150, 'Bio cannot exceed 150 characters'],
    default: ''
  },
  website: {
    type: String,
    trim: true,
    default: ''
  },
  profilePicture: {
    type: String,
    default: '/default-avatar.png'
  },
  coverPhoto: {
    type: String,
    default: '/default-cover.jpg'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationCode: {
    code: String,
    expiresAt: Date
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  followersCount: {
    type: Number,
    default: 0
  },
  followingCount: {
    type: Number,
    default: 0
  },
  channel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel'
  },
  role: {
    type: String,
    enum: ['user', 'creator', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  settings: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      newFollower: {
        type: Boolean,
        default: true
      },
      newComment: {
        type: Boolean,
        default: true
      },
      mentions: {
        type: Boolean,
        default: true
      }
    },
    privacy: {
      profileViewable: {
        type: String,
        enum: ['public', 'followers', 'private'],
        default: 'public'
      },
      showOnlineStatus: {
        type: Boolean,
        default: true
      }
    }
  },
  socialLinks: {
    youtube: {
      type: String,
      default: ''
    },
    instagram: {
      type: String,
      default: ''
    },
    twitter: {
      type: String,
      default: ''
    },
    tiktok: {
      type: String,
      default: ''
    },
    facebook: {
      type: String,
      default: ''
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

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it's modified
  if (this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error);
    }
  }
  
  // Update timestamps
  this.updatedAt = Date.now();
  
  // Update counters if followers/following arrays are modified
  if (this.isModified('followers')) {
    this.followersCount = this.followers.length;
  }
  
  if (this.isModified('following')) {
    this.followingCount = this.following.length;
  }
  
  next();
});

// Update timestamps on update
userSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  console.log('🔑 Comparing passwords...');
  console.log('  - Stored hash:', this.password ? 'exists' : 'missing');
  
  if (!candidatePassword) {
    console.error('❌ No password provided for comparison');
    return false;
  }
  
  if (!this.password) {
    console.error('❌ No stored password hash for user:', this.email);
    return false;
  }
  
  try {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log('  - Password match:', isMatch);
    return isMatch;
  } catch (error) {
    console.error('❌ Error comparing passwords:', error.message);
    return false;
  }
};

// Generate JWT token
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { 
      userId: this._id,
      email: this.email 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Remove sensitive data when sending user object as JSON
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

// Index for faster queries on email and username
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });

export default mongoose.models.User || mongoose.model('User', userSchema);
