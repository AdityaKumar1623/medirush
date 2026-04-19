const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

// GET /api/admin/orders - All orders
router.get('/orders', auth, authorize('admin'), async (req, res) => {
  try {
    const { status, urgency, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (urgency) query.urgencyLevel = urgency;

    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .populate('deliveryPartner', 'name phone')
      .sort({ priorityScore: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);
    res.json({ orders, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/orders/:id/priority - Override priority
router.put('/orders/:id/priority', auth, authorize('admin'), async (req, res) => {
  try {
    const { priorityScore, urgencyLevel } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { priorityScore, urgencyLevel, isManualPriority: true },
      { new: true }
    ).populate('user', 'name email');

    req.io.to('delivery').emit('priority_updated', { orderId: order._id, priorityScore });
    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/orders/:id/status
router.put('/orders/:id/status', auth, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    order.statusHistory.push({ status, updatedBy: req.user._id, note: 'Admin override' });
    await order.save();

    req.io.to(`order_${order._id}`).emit('order_update', { orderId: order._id, status });
    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/analytics
router.get('/analytics', auth, authorize('admin'), async (req, res) => {
  try {
    const [
      totalOrders,
      pendingOrders,
      deliveredOrders,
      criticalOrders,
      totalUsers,
      totalDelivery
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'delivered' }),
      Order.countDocuments({ urgencyLevel: 'critical' }),
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'delivery' })
    ]);

    // Orders by status
    const statusBreakdown = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Orders per day (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const dailyOrders = await Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      totalOrders, pendingOrders, deliveredOrders, criticalOrders,
      totalUsers, totalDelivery, statusBreakdown, dailyOrders
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/users
router.get('/users', auth, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
