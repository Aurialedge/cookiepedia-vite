import express from 'express';
import { 
  createChannel, 
  followUser, 
  unfollowUser, 
  getUserChannel, 
  updateChannel 
} from '../controllers/channelController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Create a channel for the authenticated user
router.post('/', protect, createChannel);

// Follow a user
router.post('/follow/:userId', protect, followUser);

// Unfollow a user
router.post('/unfollow/:userId', protect, unfollowUser);

// Get a user's channel
router.get('/user/:userId', getUserChannel);

// Update channel
router.put('/', protect, updateChannel);

export default router;
