import User from '../models/User.js';
import Channel from '../models/Channel.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

/**
 * Get user profile by username
 */
export const getUserProfile = async (req, res, next) => {
  try {
    const { username } = req.params;
    
    const user = await User.findOne({ username })
      .select('-password -verificationCode -settings -__v')
      .populate('channel', 'name description avatar coverPhoto subscriptionCount');
    
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    // Check privacy settings
    if (user.settings?.privacy?.profileViewable === 'private' && 
        req.user?._id.toString() !== user._id.toString()) {
      throw new BadRequestError('This profile is private');
    }
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, website, socialLinks } = req.body;
    const userId = req.user._id;
    
    const updates = {};
    
    if (name !== undefined) updates.name = name;
    if (bio !== undefined) updates.bio = bio;
    if (website !== undefined) updates.website = website;
    
    // Handle social links
    if (socialLinks) {
      updates.socialLinks = {};
      const validSocials = ['youtube', 'instagram', 'twitter', 'tiktok', 'facebook'];
      
      validSocials.forEach(platform => {
        if (socialLinks[platform] !== undefined) {
          updates.socialLinks[platform] = socialLinks[platform];
        }
      });
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -verificationCode -__v');
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Follow a user
 */
export const followUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;
    
    if (userId === currentUserId.toString()) {
      throw new BadRequestError('You cannot follow yourself');
    }
    
    // Check if user exists
    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      throw new NotFoundError('User not found');
    }
    
    // Check if already following
    const isFollowing = await User.findOne({
      _id: currentUserId,
      following: userId
    });
    
    if (isFollowing) {
      throw new BadRequestError('Already following this user');
    }
    
    // Add to following list
    await User.findByIdAndUpdate(
      currentUserId,
      { $addToSet: { following: userId } }
    );
    
    // Add to user's followers
    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { followers: currentUserId } }
    );
    
    // If user has a channel, add to subscribers
    if (userToFollow.channel) {
      await Channel.findByIdAndUpdate(
        userToFollow.channel,
        { $addToSet: { subscribers: currentUserId } }
      );
    }
    
    res.json({
      success: true,
      message: 'Successfully followed user'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Unfollow a user
 */
export const unfollowUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;
    
    if (userId === currentUserId.toString()) {
      throw new BadRequestError('Invalid operation');
    }
    
    // Check if user exists
    const userToUnfollow = await User.findById(userId);
    if (!userToUnfollow) {
      throw new NotFoundError('User not found');
    }
    
    // Check if following
    const isFollowing = await User.findOne({
      _id: currentUserId,
      following: userId
    });
    
    if (!isFollowing) {
      throw new BadRequestError('Not following this user');
    }
    
    // Remove from following list
    await User.findByIdAndUpdate(
      currentUserId,
      { $pull: { following: userId } }
    );
    
    // Remove from user's followers
    await User.findByIdAndUpdate(
      userId,
      { $pull: { followers: currentUserId } }
    );
    
    // If user has a channel, remove from subscribers
    if (userToUnfollow.channel) {
      await Channel.findByIdAndUpdate(
        userToUnfollow.channel,
        { $pull: { subscribers: currentUserId } }
      );
    }
    
    res.json({
      success: true,
      message: 'Successfully unfollowed user'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's followers
 */
export const getUserFollowers = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const user = await User.findById(userId)
      .select('followers')
      .populate({
        path: 'followers',
        select: 'username name profilePicture bio',
        options: {
          limit: parseInt(limit),
          skip: (parseInt(page) - 1) * parseInt(limit)
        }
      });
    
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    res.json({
      success: true,
      followers: user.followers,
      count: user.followers.length,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get users that the user is following
 */
export const getUserFollowing = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const user = await User.findById(userId)
      .select('following')
      .populate({
        path: 'following',
        select: 'username name profilePicture bio',
        options: {
          limit: parseInt(limit),
          skip: (parseInt(page) - 1) * parseInt(limit)
        }
      });
    
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    res.json({
      success: true,
      following: user.following,
      count: user.following.length,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search users
 */
export const searchUsers = async (req, res, next) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;
    
    if (!query || query.trim() === '') {
      return res.json({
        success: true,
        users: [],
        count: 0,
        page: 1,
        limit: parseInt(limit)
      });
    }
    
    const searchQuery = {
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } }
      ]
    };
    
    const [users, total] = await Promise.all([
      User.find(searchQuery)
        .select('username name profilePicture bio followersCount')
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit)),
      User.countDocuments(searchQuery)
    ]);
    
    res.json({
      success: true,
      users,
      count: users.length,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    next(error);
  }
};
