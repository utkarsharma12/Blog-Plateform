import express from 'express';
import {
  getUserProfile,
  toggleFollowUser,
  getUserFollowers,
  getUserFollowing,
  getUserBookmarks,
} from '../controllers/userController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/bookmarks', authenticateToken, getUserBookmarks);
router.get('/:username', optionalAuth, getUserProfile);
router.post('/:id/follow', authenticateToken, toggleFollowUser);
router.get('/:id/followers', getUserFollowers);
router.get('/:id/following', getUserFollowing);

export default router;
