import express from 'express';
import {
  getPublishedReviews,
  getAllReviews,
  createReview,
  updateReview,
  deleteReview,
} from '../controllers/reviewController.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadReviewImage } from '../config/cloudinary.js';

const router = express.Router();

router.get('/', getPublishedReviews);
router.get('/admin', protect, authorize('admin'), getAllReviews);
router.post('/', protect, authorize('admin'), uploadReviewImage.single('image'), createReview);
router.put('/:id', protect, authorize('admin'), uploadReviewImage.single('image'), updateReview);
router.delete('/:id', protect, authorize('admin'), deleteReview);

export default router;
