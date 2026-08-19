import express from 'express';
import {
  getProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProductImage,
  deleteProduct,
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadProductImages } from '../config/cloudinary.js';

const router = express.Router();

// Public
router.get('/', getProducts);
router.get('/slug/:slug', getProductBySlug);

// Admin/Operator
router.get('/admin/:id', protect, authorize('admin', 'operator'), getProductById);
router.post('/', protect, authorize('admin', 'operator'), uploadProductImages.array('images', 8), createProduct);
router.put('/:id', protect, authorize('admin', 'operator'), uploadProductImages.array('images', 8), updateProduct);
router.delete('/:id/images/:publicId', protect, authorize('admin', 'operator'), deleteProductImage);

// Admin only
router.delete('/:id', protect, authorize('admin'), deleteProduct);

export default router;
