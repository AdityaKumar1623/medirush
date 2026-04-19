const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema({
  status:    { type: String },
  timestamp: { type: Date, default: Date.now },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  note:      { type: String, default: '' },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user:              { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  deliveryPartner:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  medicines:         { type: String, required: true, trim: true },
  prescriptionImage: { type: String, default: '' },
  urgencyLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  priorityScore:     { type: Number, default: 0, min: 0, max: 100 },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'picked', 'in_transit', 'delivered', 'cancelled'],
    default: 'pending',
  },
  deliveryAddress:   { type: String, required: true, trim: true },
  notes:             { type: String, default: '', trim: true },
  statusHistory:     [statusHistorySchema],
  estimatedDelivery: { type: Date },
  actualDelivery:    { type: Date },
  isManualPriority:  { type: Boolean, default: false },
  keywords:          [String],
  location: {
    lat: { type: Number, default: 28.6139 },
    lng: { type: Number, default: 77.2090 },
  },
}, { timestamps: true });

// FIX: async pre-save without next() parameter
orderSchema.pre('save', async function () {
  if (!this.isManualPriority) {
    this.priorityScore = calcPriority(this);
  }
});

function calcPriority(order) {
  let score = 0;
  const text = ((order.medicines || '') + ' ' + (order.notes || '')).toLowerCase();

  const critical = ['icu', 'emergency', 'critical', 'heart attack', 'stroke', 'unconscious', 'severe'];
  const high     = ['urgent', 'immediate', 'asap', 'fever', 'accident', 'injury', 'pain'];
  const med      = ['needed', 'soon', 'diabetes', 'blood pressure', 'insulin'];

  critical.forEach(k => { if (text.includes(k)) score += 40; });
  high.forEach(k    => { if (text.includes(k)) score += 20; });
  med.forEach(k     => { if (text.includes(k)) score += 10; });

  const urgencyMap = { low: 0, medium: 20, high: 40, critical: 60 };
  score += urgencyMap[order.urgencyLevel] || 0;

  const h = new Date().getHours();
  if (h >= 22 || h <= 6) score += 15;
  if (order.prescriptionImage) score += 10;

  return Math.min(score, 100);
}

module.exports = mongoose.model('Order', orderSchema);
