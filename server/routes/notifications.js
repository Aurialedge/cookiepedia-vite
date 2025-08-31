import express from 'express';
import { auth } from '../middleware/auth.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// Get all notifications for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('sender', 'username profilePicture fullName')
      .populate('post', 'images')
      .populate('comment', 'content')
      .populate('message', 'content')
      .populate('conversation', 'participants');

    const total = await Notification.countDocuments({ user: req.user._id });
    const unreadCount = await Notification.countDocuments({ 
      user: req.user._id, 
      read: false 
    });

    res.json({
      success: true,
      notifications,
      total,
      unreadCount,
      hasMore: skip + notifications.length < total
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Mark all notifications as read
router.post('/mark-all-read', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { $set: { read: true } }
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Mark a single notification as read
router.post('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: { read: true } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({ success: true, notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete a notification
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get unread notifications count
router.get('/unread-count', auth, async (req, res) => {
  try {
    const count = await Notification.countDocuments({ 
      user: req.user._id, 
      read: false 
    });

    res.json({ success: true, count });
  } catch (error) {
    console.error('Error getting unread notifications count:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
