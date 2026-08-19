import express from 'express';
import {
  submitContactEnquiry,
  getContactEnquiries,
  markContactEnquiryRead,
  deleteContactEnquiry,
} from '../controllers/enquiryController.js';
import {
  submitBusinessPartner,
  getBusinessPartnerApplications,
  markBusinessPartnerRead,
  deleteBusinessPartner,
} from '../controllers/businessPartnerController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Contact form
router.post('/contact', submitContactEnquiry);
router.get('/contact', protect, authorize('admin'), getContactEnquiries);
router.put('/contact/:id/read', protect, authorize('admin'), markContactEnquiryRead);
router.delete('/contact/:id', protect, authorize('admin'), deleteContactEnquiry);

// Business partner applications
router.post('/business-partner', submitBusinessPartner);
router.get('/business-partner', protect, authorize('admin'), getBusinessPartnerApplications);
router.put('/business-partner/:id/read', protect, authorize('admin'), markBusinessPartnerRead);
router.delete('/business-partner/:id', protect, authorize('admin'), deleteBusinessPartner);

export default router;
