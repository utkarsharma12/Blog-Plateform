import express from 'express';
import {
  getCommentsByPost,
  createComment,
  deleteComment,
  toggleLikeComment,
} from '../controllers/commentController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/post/:postId', optionalAuth, getCommentsByPost);
router.post('/post/:postId', authenticateToken, createComment);
router.delete('/:id', authenticateToken, deleteComment);
router.post('/:id/like', authenticateToken, toggleLikeComment);

export default router;
