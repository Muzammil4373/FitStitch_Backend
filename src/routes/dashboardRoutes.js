import express from 'express';
import { getDashboardSummary } from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/summary', protect, authorize('admin', 'operator'), getDashboardSummary);

export default router;
