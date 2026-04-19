const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { auth, authorize } = require('../middleware/auth');

// POST /api/orders - Create order
router.post('/', auth, authorize('user'), async (req, res) => {
  try {
    const { medicines, urgencyLevel, deliveryAddress, notes, prescriptionImage, location } = req.body;

    // Auto-detect keywords
    const criticalKws = ['icu', 'emergency', 'critical', 'heart attack', 'stroke'];
    const highKws = ['urgent', 'immediate', 'asap', 'fever', 'accident'];
    const text = (medicines + ' ' + notes).toLowerCase();
    const foundKeywords = [...criticalKws, ...highKws].filter(kw => text.includes(kw));

    // Auto-override urgency if critical keywords found
    let finalUrgency = urgencyLevel || 'medium';
    if (criticalKws.some(kw => text.includes(kw))) finalUrgency = 'critical';
    else if (highKws.some(kw => text.includes(kw)) && finalUrgency === 'medium') finalUrgency = 'high';

    const order = await Order.create({
      user: req.user._id,
      medicines,
      urgencyLevel: finalUrgency,
      deliveryAddress,
      notes,
      prescriptionImage: prescriptionImage || '',
      keywords: foundKeywords,
      location: location || { lat: 28.6139, lng: 77.2090 },
      statusHistory: [{ status: 'pending', updatedBy: req.user._id }]
    });

    await order.populate('user', 'name email phone');

    // Emit to admin/delivery rooms
    req.io.to('admin').emit('new_order', order);
    req.io.to('delivery').emit('new_order', order);

    res.status(201).json({ order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders - User's orders
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'user') query.user = req.user._id;
    else if (req.user.role === 'delivery') query.deliveryPartner = req.user._id;

    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .populate('deliveryPartner', 'name phone')
      .sort({ priorityScore: -1, createdAt: -1 });

    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone address')
      .populate('deliveryPartner', 'name phone');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/orders/:id/cancel
router.put('/:id/cancel', auth, authorize('user'), async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!['pending'].includes(order.status)) {
      return res.status(400).json({ message: 'Cannot cancel this order' });
    }
    order.status = 'cancelled';
    order.statusHistory.push({ status: 'cancelled', updatedBy: req.user._id });
    await order.save();

    req.io.to(`order_${order._id}`).emit('order_update', { orderId: order._id, status: 'cancelled' });
    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
