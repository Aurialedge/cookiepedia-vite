import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getUserProfile,
  updateProfile,
  followUser,
  unfollowUser,
  getUserFollowers,
  getUserFollowing,
  searchUsers
} from '../controllers/userController.js';

const router = express.Router();

// Public routes
router.get('/search', searchUsers);
router.get('/:username', getUserProfile);
router.get('/:userId/followers', getUserFollowers);
router.get('/:userId/following', getUserFollowing);

// Protected routes (require authentication)
router.use(protect);

// Profile routes
router.put('/profile', updateProfile);

// Follow/Unfollow routes
router.post('/:userId/follow', followUser);
router.post('/:userId/unfollow', unfollowUser);

export default router;
