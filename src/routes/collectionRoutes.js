import express from 'express';
import { getCollections, createCollection, updateCollection, deleteCollection } from '../controllers/collectionController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getCollections);
router.post('/', protect, authorize('admin', 'operator'), createCollection);
router.put('/:id', protect, authorize('admin', 'operator'), updateCollection);
router.delete('/:id', protect, authorize('admin'), deleteCollection);

export default router;
