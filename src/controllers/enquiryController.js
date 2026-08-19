import asyncHandler from 'express-async-handler';
import ContactEnquiry from '../models/ContactEnquiry.js';
import { sendAdminNotification } from '../utils/sendEmail.js';

// @route  POST /api/enquiries/contact
// @access Public
export const submitContactEnquiry = asyncHandler(async (req, res) => {
  const { name, phone, email, message } = req.body;
  if (!name || !phone || !email || !message) {
    res.status(400);
    throw new Error('Name, phone, email, and message are required');
  }
  const enquiry = await ContactEnquiry.create({ name, phone, email, message });

  sendAdminNotification(
    'New Contact Enquiry — FitStitch',
    `<p><strong>${name}</strong> (${phone}, ${email})</p><p>${message}</p>`
  );

  res.status(201).json({ message: 'Enquiry received', enquiry });
});

// @route  GET /api/enquiries/contact
// @access Private/Admin
export const getContactEnquiries = asyncHandler(async (req, res) => {
  const enquiries = await ContactEnquiry.find().sort('-createdAt');
  res.json(enquiries);
});

// @route  PUT /api/enquiries/contact/:id/read
// @access Private/Admin
export const markContactEnquiryRead = asyncHandler(async (req, res) => {
  const enquiry = await ContactEnquiry.findById(req.params.id);
  if (!enquiry) {
    res.status(404);
    throw new Error('Enquiry not found');
  }
  enquiry.isRead = true;
  await enquiry.save();
  res.json(enquiry);
});

// @route  DELETE /api/enquiries/contact/:id
// @access Private/Admin
export const deleteContactEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await ContactEnquiry.findById(req.params.id);
  if (!enquiry) {
    res.status(404);
    throw new Error('Enquiry not found');
  }
  await enquiry.deleteOne();
  res.json({ message: 'Enquiry removed' });
});
