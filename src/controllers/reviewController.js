import asyncHandler from 'express-async-handler';
import Review from '../models/Review.js';
import cloudinary from '../config/cloudinary.js';

// @route  GET /api/reviews
// @access Public — published reviews only
export const getPublishedReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ isPublished: true }).sort('-createdAt');
  res.json(reviews);
});

// @route  GET /api/reviews/admin
// @access Private/Admin
export const getAllReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find().sort('-createdAt');
  res.json(reviews);
});

// @route  POST /api/reviews
// @access Private/Admin
export const createReview = asyncHandler(async (req, res) => {
  const { name, rating, review } = req.body;
  if (!name || !rating || !review) {
    res.status(400);
    throw new Error('Name, rating, and review text are required');
  }
  const image = req.file ? req.file.path : undefined;
  const imagePublicId = req.file ? req.file.filename : undefined;

  const created = await Review.create({ name, rating, review, image, imagePublicId });
  res.status(201).json(created);
});

// @route  PUT /api/reviews/:id
// @access Private/Admin
export const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }
  ['name', 'rating', 'review', 'isPublished'].forEach((f) => {
    if (req.body[f] !== undefined) review[f] = req.body[f];
  });
  if (req.file) {
    review.image = req.file.path;
    review.imagePublicId = req.file.filename;
  }
  await review.save();
  res.json(review);
});

// @route  DELETE /api/reviews/:id
// @access Private/Admin
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }
  if (review.imagePublicId) {
    await cloudinary.uploader.destroy(review.imagePublicId).catch(() => {});
  }
  await review.deleteOne();
  res.json({ message: 'Review removed' });
});
