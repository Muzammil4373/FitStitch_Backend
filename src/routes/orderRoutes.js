import express from 'express';
import { createOrder, getOrders, updateOrderStatus, deleteOrder } from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', createOrder);
router.get('/', protect, authorize('admin', 'operator'), getOrders);
router.put('/:id/status', protect, authorize('admin'), updateOrderStatus);
router.delete('/:id', protect, authorize('admin'), deleteOrder);

export default router;
