const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { auth, authorize } = require('../middleware/auth');

// GET /api/delivery/available - Get available high-priority orders
router.get('/available', auth, authorize('delivery'), async (req, res) => {
  try {
    const orders = await Order.find({ status: 'pending', deliveryPartner: null })
      .populate('user', 'name phone address')
      .sort({ priorityScore: -1, createdAt: 1 });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/delivery/:id/accept
router.post('/:id/accept', auth, authorize('delivery'), async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, status: 'pending' });
    if (!order) return res.status(404).json({ message: 'Order not available' });

    order.deliveryPartner = req.user._id;
    order.status = 'accepted';
    order.statusHistory.push({ status: 'accepted', updatedBy: req.user._id, note: 'Delivery partner assigned' });
    order.estimatedDelivery = new Date(Date.now() + 30 * 60 * 1000); // 30 min
    await order.save();
    await order.populate(['user', 'deliveryPartner']);

    req.io.to(`order_${order._id}`).emit('order_update', {
      orderId: order._id,
      status: 'accepted',
      deliveryPartner: { name: req.user.name, phone: req.user.phone }
    });
    req.io.to(`user_${order.user._id}`).emit('notification', {
      type: 'order_accepted',
      message: `Your order has been accepted by ${req.user.name}`,
      orderId: order._id
    });

    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/delivery/:id/reject
router.post('/:id/reject', auth, authorize('delivery'), async (req, res) => {
  try {
    res.json({ message: 'Order rejected, available for others' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/delivery/:id/status
router.put('/:id/status', auth, authorize('delivery'), async (req, res) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['picked', 'in_transit', 'delivered'];
    if (!validStatuses.includes(status)) return res.status(400).json({ message: 'Invalid status' });

    const order = await Order.findOne({ _id: req.params.id, deliveryPartner: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    order.statusHistory.push({ status, updatedBy: req.user._id, note });
    if (status === 'delivered') order.actualDelivery = new Date();
    await order.save();

    req.io.to(`order_${order._id}`).emit('order_update', { orderId: order._id, status, note });
    req.io.to(`user_${order.user}`).emit('notification', {
      type: 'status_update',
      message: `Order status updated to: ${status.replace('_', ' ')}`,
      orderId: order._id,
      status
    });

    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/delivery/my-orders
router.get('/my-orders', auth, authorize('delivery'), async (req, res) => {
  try {
    const orders = await Order.find({ deliveryPartner: req.user._id })
      .populate('user', 'name phone address')
      .sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
