import express from 'express';
import {
  createReport,
  getAdminStats,
  getReports,
  updateReportStatus,
  getAllUsers,
  deleteUserByAdmin,
} from '../controllers/adminController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Any user can file a report
router.post('/reports', authenticateToken, createReport);

// Admin-only endpoints
router.get('/stats', authenticateToken, requireAdmin, getAdminStats);
router.get('/reports', authenticateToken, requireAdmin, getReports);
router.put('/reports/:id', authenticateToken, requireAdmin, updateReportStatus);
router.get('/users', authenticateToken, requireAdmin, getAllUsers);
router.delete('/users/:id', authenticateToken, requireAdmin, deleteUserByAdmin);

export default router;
