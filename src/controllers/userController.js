import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

// @route  GET /api/users
// @access Private/Admin
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort('-createdAt');
  res.json(users);
});

// @route  POST /api/users
// @access Private/Admin
export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const exists = await User.findOne({ email: email?.toLowerCase() });
  if (exists) {
    res.status(400);
    throw new Error('A user with this email already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role === 'admin' ? 'admin' : 'operator',
  });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
});

// @route  PUT /api/users/:id
// @access Private/Admin
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.name = req.body.name ?? user.name;
  user.role = req.body.role === 'admin' ? 'admin' : req.body.role === 'operator' ? 'operator' : user.role;
  if (typeof req.body.isActive === 'boolean') user.isActive = req.body.isActive;
  if (req.body.password) user.password = req.body.password;

  await user.save();
  res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, isActive: user.isActive });
});

// @route  DELETE /api/users/:id
// @access Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.role === 'admin') {
    res.status(403);
    throw new Error('Admin accounts cannot be deleted from this panel');
  }
  if (String(user._id) === String(req.user._id)) {
    res.status(400);
    throw new Error('You cannot delete your own account');
  }

  await user.deleteOne();
  res.json({ message: 'User removed' });
});
