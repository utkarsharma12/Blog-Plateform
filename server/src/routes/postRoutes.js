import express from 'express';
import {
  getPosts,
  getFollowingFeed,
  getTrendingPosts,
  getPostBySlugOrId,
  createPost,
  updatePost,
  deletePost,
  toggleLikePost,
  toggleBookmarkPost,
  getCategoriesAndTags,
} from '../controllers/postController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getPosts);
router.get('/following', authenticateToken, getFollowingFeed);
router.get('/trending', optionalAuth, getTrendingPosts);
router.get('/meta/categories-tags', getCategoriesAndTags);
router.get('/:identifier', optionalAuth, getPostBySlugOrId);

router.post('/', authenticateToken, createPost);
router.put('/:id', authenticateToken, updatePost);
router.delete('/:id', authenticateToken, deletePost);

router.post('/:id/like', authenticateToken, toggleLikePost);
router.post('/:id/bookmark', authenticateToken, toggleBookmarkPost);

export default router;
