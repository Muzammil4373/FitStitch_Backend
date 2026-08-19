import asyncHandler from 'express-async-handler';
import Collection from '../models/Collection.js';
import { slugify } from '../utils/slugify.js';

export const getCollections = asyncHandler(async (req, res) => {
  const collections = await Collection.find().sort('name');
  res.json(collections);
});

// @access Private (admin/operator)
export const createCollection = asyncHandler(async (req, res) => {
  const { name, description, image } = req.body;
  if (!name) {
    res.status(400);
    throw new Error('Collection name is required');
  }
  const collection = await Collection.create({ name, slug: slugify(name), description, image });
  res.status(201).json(collection);
});

// @access Private (admin/operator)
export const updateCollection = asyncHandler(async (req, res) => {
  const collection = await Collection.findById(req.params.id);
  if (!collection) {
    res.status(404);
    throw new Error('Collection not found');
  }
  if (req.body.name) {
    collection.name = req.body.name;
    collection.slug = slugify(req.body.name);
  }
  if (req.body.description !== undefined) collection.description = req.body.description;
  if (req.body.image !== undefined) collection.image = req.body.image;
  await collection.save();
  res.json(collection);
});

// @access Private/Admin only
export const deleteCollection = asyncHandler(async (req, res) => {
  const collection = await Collection.findById(req.params.id);
  if (!collection) {
    res.status(404);
    throw new Error('Collection not found');
  }
  await collection.deleteOne();
  res.json({ message: 'Collection removed' });
});
