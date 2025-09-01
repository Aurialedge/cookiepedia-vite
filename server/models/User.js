import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.']
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationCode: {
    code: String,
    expiresAt: Date
  },
  profilePicture: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: 150,
    default: ''
  },
  website: {
    type: String,
    default: ''
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  channel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
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
