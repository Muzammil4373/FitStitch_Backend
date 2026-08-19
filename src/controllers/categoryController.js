import asyncHandler from 'express-async-handler';
import Category from '../models/Category.js';
import { slugify } from '../utils/slugify.js';

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort('name');
  res.json(categories);
});

// @access Private/Admin
export const createCategory = asyncHandler(async (req, res) => {
  const { name, image } = req.body;
  if (!name) {
    res.status(400);
    throw new Error('Category name is required');
  }
  const category = await Category.create({ name, slug: slugify(name), image });
  res.status(201).json(category);
});

// @access Private/Admin
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  if (req.body.name) {
    category.name = req.body.name;
    category.slug = slugify(req.body.name);
  }
  if (req.body.image !== undefined) category.image = req.body.image;
  await category.save();
  res.json(category);
});

// @access Private/Admin
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  await category.deleteOne();
  res.json({ message: 'Category removed' });
});
