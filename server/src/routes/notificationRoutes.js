import express from 'express';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../controllers/notificationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getUserNotifications);
router.put('/read-all', authenticateToken, markAllNotificationsAsRead);
router.put('/:id/read', authenticateToken, markNotificationAsRead);

export default router;
