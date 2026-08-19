import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import ContactEnquiry from '../models/ContactEnquiry.js';
import BusinessPartner from '../models/BusinessPartner.js';

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// @route  GET /api/dashboard/summary
// @access Private (admin/operator)
export const getDashboardSummary = asyncHandler(async (req, res) => {
  const today = startOfToday();

  const [
    totalProducts,
    totalOrders,
    totalEnquiries,
    totalBusinessPartners,
    todaysOrders,
    todaysEnquiries,
    recentOrders,
    ordersByStatus,
  ] = await Promise.all([
    Product.countDocuments(),
    Order.countDocuments(),
    ContactEnquiry.countDocuments(),
    BusinessPartner.countDocuments(),
    Order.countDocuments({ createdAt: { $gte: today } }),
    ContactEnquiry.countDocuments({ createdAt: { $gte: today } }),
    Order.find().sort('-createdAt').limit(8),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);

  // Last 7 days order volume, for a simple line/bar chart
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const last7Days = await Order.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({
    totals: {
      products: totalProducts,
      orders: totalOrders,
      enquiries: totalEnquiries,
      businessPartners: totalBusinessPartners,
    },
    today: {
      orders: todaysOrders,
      enquiries: todaysEnquiries,
    },
    recentOrders,
    ordersByStatus,
    ordersLast7Days: last7Days,
  });
});
