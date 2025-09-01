import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Channel from '../models/Channel.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to authenticate user
export const protect = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token, authorization denied' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Find user and populate channel
    const user = await User.findOne({ _id: decoded.userId })
      .select('-password')
      .populate('channel', 'name avatar subscriptionCount');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token is not valid' 
      });
    }

    // Add user to request object
    req.user = user;
    req.userId = user._id;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired',
        expired: true
      });
    }
    res.status(401).json({ 
      success: false, 
      message: 'Not authorized, token failed',
      error: error.message
    });
  }
};

// Middleware to check if user is admin
export const admin = async (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      message: 'Not authorized as admin' 
    });
  }
};

// Middleware to check if user owns the channel
export const channelOwner = async (req, res, next) => {
  try {
    const channel = await Channel.findById(req.params.channelId);
    
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found'
      });
    }

    // Check if user is the owner of the channel
    if (channel.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this channel'
      });
    }

    req.channel = channel;
    next();
  } catch (error) {
    console.error('Channel owner check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Middleware to check if user is following another user
export const isFollowing = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(req.user._id);
    
    const isFollowing = user.following.includes(userId);
    
    if (!isFollowing) {
      return res.status(403).json({
        success: false,
        message: 'You must be following this user to perform this action'
      });
    }
    
    next();
  } catch (error) {
    console.error('Following check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
