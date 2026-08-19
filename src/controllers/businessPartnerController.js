import asyncHandler from 'express-async-handler';
import BusinessPartner from '../models/BusinessPartner.js';
import { sendAdminNotification } from '../utils/sendEmail.js';

// @route  POST /api/enquiries/business-partner
// @access Public
export const submitBusinessPartner = asyncHandler(async (req, res) => {
  const { dealerName, businessName, address, city, state, pincode, phone, email, businessType, message } = req.body;

  if (!dealerName || !businessName || !address || !city || !state || !pincode || !phone || !email || !businessType) {
    res.status(400);
    throw new Error('All fields except message are required');
  }

  const application = await BusinessPartner.create({
    dealerName, businessName, address, city, state, pincode, phone, email, businessType, message,
  });

  sendAdminNotification(
    'New Business Partner Application — FitStitch',
    `<p><strong>${dealerName}</strong> — ${businessName} (${businessType})</p>
     <p>${city}, ${state} ${pincode}</p>
     <p>${phone} / ${email}</p>`
  );

  res.status(201).json({ message: 'Application received', application });
});

// @route  GET /api/enquiries/business-partner
// @access Private/Admin
export const getBusinessPartnerApplications = asyncHandler(async (req, res) => {
  const applications = await BusinessPartner.find().sort('-createdAt');
  res.json(applications);
});

// @route  PUT /api/enquiries/business-partner/:id/read
// @access Private/Admin
export const markBusinessPartnerRead = asyncHandler(async (req, res) => {
  const application = await BusinessPartner.findById(req.params.id);
  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }
  application.isRead = true;
  await application.save();
  res.json(application);
});

// @route  DELETE /api/enquiries/business-partner/:id
// @access Private/Admin
export const deleteBusinessPartner = asyncHandler(async (req, res) => {
  const application = await BusinessPartner.findById(req.params.id);
  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }
  await application.deleteOne();
  res.json({ message: 'Application removed' });
});
