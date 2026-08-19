import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';
import cloudinary from '../config/cloudinary.js';
import { slugify } from '../utils/slugify.js';

// @route  GET /api/products
// @access Public
// Supports ?category=&collection=&q=&featured=true&trending=true&newArrival=true&sort=price-asc|price-desc|newest
export const getProducts = asyncHandler(async (req, res) => {
  const { category, collection, q, featured, trending, newArrival, sort, page = 1, limit = 24 } = req.query;

  const filter = { isActive: true };
  if (category) filter.category = category;
  if (collection) filter.collection = collection;
  if (featured === 'true') filter.isFeatured = true;
  if (trending === 'true') filter.isTrending = true;
  if (newArrival === 'true') filter.isNewArrival = true;
  if (q) filter.$text = { $search: q };

  let sortOption = '-createdAt';
  if (sort === 'price-asc') sortOption = 'price';
  if (sort === 'price-desc') sortOption = '-price';
  if (sort === 'newest') sortOption = '-createdAt';

  const skip = (Number(page) - 1) * Number(limit);

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name slug')
      .populate('collection', 'name slug')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit)),
    Product.countDocuments(filter),
  ]);

  res.json({ products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

// @route  GET /api/products/:slug
// @access Public
export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true })
    .populate('category', 'name slug')
    .populate('collection', 'name slug');

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json(product);
});

// @route  GET /api/products/admin/:id
// @access Private (admin/operator)
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json(product);
});

// @route  POST /api/products
// @access Private (admin/operator)
export const createProduct = asyncHandler(async (req, res) => {
  const { title, description, price, discount, category, collection, sizes, stock, isFeatured, isTrending, isNewArrival } = req.body;

  if (!title || !description || !price) {
    res.status(400);
    throw new Error('Title, description and price are required');
  }

  let baseSlug = slugify(title);
  let slug = baseSlug;
  let counter = 1;
  while (await Product.findOne({ slug })) {
    slug = `${baseSlug}-${counter++}`;
  }

  const images = (req.files || []).map((f) => ({ url: f.path, publicId: f.filename }));

  const product = await Product.create({
    title,
    slug,
    description,
    price,
    discount: discount || 0,
    category: category || undefined,
    collection: collection || undefined,
    sizes: sizes ? (Array.isArray(sizes) ? sizes : sizes.split(',')) : undefined,
    stock: stock || 0,
    images,
    isFeatured: isFeatured === 'true' || isFeatured === true,
    isTrending: isTrending === 'true' || isTrending === true,
    isNewArrival: isNewArrival === 'true' || isNewArrival === true,
  });

  res.status(201).json(product);
});

// @route  PUT /api/products/:id
// @access Private (admin/operator)
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const fields = [
    'title', 'description', 'price', 'discount', 'category', 'collection',
    'stock', 'isFeatured', 'isTrending', 'isNewArrival', 'isActive',
  ];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) product[field] = req.body[field];
  });

  if (req.body.sizes) {
    product.sizes = Array.isArray(req.body.sizes) ? req.body.sizes : req.body.sizes.split(',');
  }

  if (req.body.title && req.body.title !== product.title) {
    let baseSlug = slugify(req.body.title);
    let slug = baseSlug;
    let counter = 1;
    while (await Product.findOne({ slug, _id: { $ne: product._id } })) {
      slug = `${baseSlug}-${counter++}`;
    }
    product.slug = slug;
  }

  if (req.files && req.files.length > 0) {
    const newImages = req.files.map((f) => ({ url: f.path, publicId: f.filename }));
    product.images = [...product.images, ...newImages];
  }

  await product.save();
  res.json(product);
});

// @route  DELETE /api/products/:id/images/:publicId
// @access Private (admin/operator) — remove a single image
export const deleteProductImage = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  const { publicId } = req.params;
  product.images = product.images.filter((img) => img.publicId !== publicId);
  await product.save();

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('[cloudinary] failed to delete image:', err.message);
  }

  res.json(product);
});

// @route  DELETE /api/products/:id
// @access Private/Admin only
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  await Promise.all(
    product.images.map((img) =>
      img.publicId ? cloudinary.uploader.destroy(img.publicId).catch(() => {}) : Promise.resolve()
    )
  );

  await product.deleteOne();
  res.json({ message: 'Product removed' });
});
