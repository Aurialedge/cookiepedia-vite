import Channel from '../models/Channel.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

// Create a new channel for a user
export const createChannel = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.userId;

    // Check if user already has a channel
    const existingChannel = await Channel.findOne({ owner: userId });
    if (existingChannel) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already has a channel' 
      });
    }

    // Create new channel
    const channel = new Channel({
      name: name || req.user.username + "'s Channel",
      description: description || '',
      owner: userId,
      avatar: req.user.profilePicture || ''
    });

    await channel.save();

    // Update user with channel reference
    await User.findByIdAndUpdate(userId, { channel: channel._id });

    res.status(201).json({
      success: true,
      channel
    });
  } catch (error) {
    console.error('Error creating channel:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Follow a user
export const followUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.userId;

    if (userId === currentUserId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself'
      });
    }

    // Check if user exists
    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already following
    const currentUser = await User.findById(currentUserId);
    if (currentUser.following.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Already following this user'
      });
    }

    // Update both users
    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { following: userId }
    });

    await User.findByIdAndUpdate(userId, {
      $addToSet: { followers: currentUserId }
    });

    // If user has a channel, add to subscribers
    if (userToFollow.channel) {
      await Channel.findByIdAndUpdate(userToFollow.channel, {
        $addToSet: { subscribers: currentUserId },
        $inc: { subscriptionCount: 1 }
      });
    }

    res.json({
      success: true,
      message: 'Successfully followed user'
    });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Unfollow a user
export const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.userId;

    // Check if user exists
    const userToUnfollow = await User.findById(userId);
    if (!userToUnfollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update both users
    await User.findByIdAndUpdate(currentUserId, {
      $pull: { following: userId }
    });

    await User.findByIdAndUpdate(userId, {
      $pull: { followers: currentUserId }
    });

    // If user has a channel, remove from subscribers
    if (userToUnfollow.channel) {
      await Channel.findByIdAndUpdate(userToUnfollow.channel, {
        $pull: { subscribers: currentUserId },
        $inc: { subscriptionCount: -1 }
      });
    }

    res.json({
      success: true,
      message: 'Successfully unfollowed user'
    });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get user's channel
export const getUserChannel = async (req, res) => {
  try {
    const { userId } = req.params;
    const channel = await Channel.findOne({ owner: userId })
      .populate('owner', 'username profilePicture')
      .populate('subscribers', 'username profilePicture');

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found'
      });
    }

    res.json({
      success: true,
      channel
    });
  } catch (error) {
    console.error('Error getting channel:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update channel
export const updateChannel = async (req, res) => {
  try {
    const { name, description, avatar, coverPhoto, socialLinks, preferences } = req.body;
    const userId = req.user.userId;

    const channel = await Channel.findOne({ owner: userId });
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found'
      });
    }

    // Update fields if provided
    if (name) channel.name = name;
    if (description) channel.description = description;
    if (avatar) channel.avatar = avatar;
    if (coverPhoto) channel.coverPhoto = coverPhoto;
    if (socialLinks) {
      channel.socialLinks = { ...channel.socialLinks, ...socialLinks };
    }
    if (preferences) {
      channel.preferences = { ...channel.preferences, ...preferences };
    }

    await channel.save();

    res.json({
      success: true,
      channel
    });
  } catch (error) {
    console.error('Error updating channel:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
