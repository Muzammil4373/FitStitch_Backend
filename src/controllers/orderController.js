import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import { sendAdminNotification } from '../utils/sendEmail.js';

// @route  POST /api/orders
// @access Public — called right before redirecting the customer to WhatsApp,
// so the order is logged for the admin dashboard even though payment/
// confirmation happens over chat.
export const createOrder = asyncHandler(async (req, res) => {
  const { customerName, phone, email, items, subtotal, notes } = req.body;

  if (!customerName || !phone || !items?.length) {
    res.status(400);
    throw new Error('Customer name, phone, and at least one item are required');
  }

  const order = await Order.create({ customerName, phone, email, items, subtotal, notes });

  sendAdminNotification(
    'New WhatsApp Order — FitStitch',
    `<p>New order from <strong>${customerName}</strong> (${phone})</p>
     <p>Subtotal: ₹${subtotal}</p>
     <ul>${items.map((i) => `<li>${i.title} — Size ${i.size} × ${i.quantity}</li>`).join('')}</ul>`
  );

  res.status(201).json(order);
});

// @route  GET /api/orders
// @access Private (admin/operator, read-only for operator)
// Supports ?status=&q=&page=&limit=
export const getOrders = asyncHandler(async (req, res) => {
  const { status, q, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (q) {
    filter.$or = [
      { customerName: { $regex: q, $options: 'i' } },
      { phone: { $regex: q, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [orders, total] = await Promise.all([
    Order.find(filter).sort('-createdAt').skip(skip).limit(Number(limit)),
    Order.countDocuments(filter),
  ]);

  res.json({ orders, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

// @route  PUT /api/orders/:id/status
// @access Private/Admin
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ['pending', 'confirmed', 'delivered', 'cancelled'];
  if (!allowed.includes(status)) {
    res.status(400);
    throw new Error(`Status must be one of: ${allowed.join(', ')}`);
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  order.status = status;
  await order.save();
  res.json(order);
});

// @route  DELETE /api/orders/:id
// @access Private/Admin
export const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  await order.deleteOne();
  res.json({ message: 'Order removed' });
});
