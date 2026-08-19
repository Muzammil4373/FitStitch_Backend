import asyncHandler from 'express-async-handler';
import Banner from '../models/Banner.js';
import cloudinary from '../config/cloudinary.js';

// @route  GET /api/banners
// @access Public
export const getActiveBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find({ isActive: true }).sort('order');
  res.json(banners);
});

// @route  GET /api/banners/admin
// @access Private/Admin
export const getAllBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find().sort('order');
  res.json(banners);
});

// @route  POST /api/banners
// @access Private/Admin
export const createBanner = asyncHandler(async (req, res) => {
  const { heading, description, ctaText, ctaLink, order } = req.body;
  if (!heading || !req.file) {
    res.status(400);
    throw new Error('Heading and an image are required');
  }
  const banner = await Banner.create({
    heading,
    description,
    ctaText,
    ctaLink,
    order: order || 0,
    image: req.file.path,
    imagePublicId: req.file.filename,
  });
  res.status(201).json(banner);
});

// @route  PUT /api/banners/:id
// @access Private/Admin
export const updateBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) {
    res.status(404);
    throw new Error('Banner not found');
  }
  ['heading', 'description', 'ctaText', 'ctaLink', 'order', 'isActive'].forEach((f) => {
    if (req.body[f] !== undefined) banner[f] = req.body[f];
  });
  if (req.file) {
    banner.image = req.file.path;
    banner.imagePublicId = req.file.filename;
  }
  await banner.save();
  res.json(banner);
});

// @route  DELETE /api/banners/:id
// @access Private/Admin
export const deleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) {
    res.status(404);
    throw new Error('Banner not found');
  }
  if (banner.imagePublicId) {
    await cloudinary.uploader.destroy(banner.imagePublicId).catch(() => {});
  }
  await banner.deleteOne();
  res.json({ message: 'Banner removed' });
});
