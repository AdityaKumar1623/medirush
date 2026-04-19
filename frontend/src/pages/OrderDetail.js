import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, User, Clock, Package, Image, Navigation, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/shared/Navbar';
import { StatusBadge, UrgencyBadge, PriorityBar } from '../components/shared/Badges';
import api from '../utils/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const STEPS = [
  { key: 'pending',    label: 'Order Placed',     icon: Package },
  { key: 'accepted',   label: 'Partner Assigned', icon: User },
  { key: 'picked',     label: 'Picked Up',        icon: Package },
  { key: 'in_transit', label: 'In Transit',       icon: Navigation },
  { key: 'delivered',  label: 'Delivered',        icon: CheckCircle },
];
const STEP_IDX = { pending: 0, accepted: 1, picked: 2, in_transit: 3, delivered: 4 };

const OrderDetail = () => {
  const { id }    = useParams();
  const { user }  = useAuth();
  const { socket } = useSocket();
  const [order, setOrder]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(res => setOrder(res.data.order))
      .catch(() => toast.error('Order not found'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!socket || !id) return;
    socket.emit('join_order', id);
    const onUpdate = ({ orderId, status, note }) => {
      if (orderId === id) {
        setOrder(prev => prev ? { ...prev, status } : prev);
        toast.success(`Status: ${status.replace('_', ' ')}${note ? ' — ' + note : ''}`, { icon: '📦' });
      }
    };
    socket.on('order_update', onUpdate);
    return () => {
      socket.emit('leave_order', id);
      socket.off('order_update', onUpdate);
    };
  }, [socket, id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0f1e' }}>
      <div className="w-10 h-10 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
    </div>
  );
  if (!order) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0f1e' }}>
      <div className="text-center">
        <p className="text-white font-bold text-xl mb-4">Order not found</p>
        <Link to="/dashboard" className="text-sky-400 hover:text-sky-300">← Back</Link>
      </div>
    </div>
  );

  const currentStep  = STEP_IDX[order.status] ?? 0;
  const isCancelled  = order.status === 'cancelled';
  const backLink     = user?.role === 'admin' ? '/admin' : user?.role === 'delivery' ? '/delivery' : '/dashboard';

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1527 100%)' }}>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to={backLink} className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <StatusBadge status={order.status} size="md" />
                    <UrgencyBadge level={order.urgencyLevel} size="md" />
                    {order.isManualPriority && (
                      <span className="px-2.5 py-1 text-xs rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">Manual Priority</span>
                    )}
                  </div>
                  <p className="font-mono text-slate-600 text-xs">#{order._id.slice(-8).toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500 text-xs mb-0.5">Priority Score</p>
                  <p className="text-2xl font-black gradient-text">{order.priorityScore}</p>
                </div>
              </div>
              <PriorityBar score={order.priorityScore} />
              <div className="mt-4">
                <p className="text-slate-500 text-xs font-medium mb-1 uppercase tracking-wide">Medicines</p>
                <p className="text-white font-semibold">{order.medicines}</p>
              </div>
              {order.notes && (
                <div className="mt-3 pt-3 border-t border-white/5">
                  <p className="text-slate-500 text-xs font-medium mb-1 uppercase tracking-wide">Notes</p>
                  <p className="text-slate-300 text-sm">{order.notes}</p>
                </div>
              )}
              {order.keywords?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {order.keywords.map(kw => (
                    <span key={kw} className="px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-xs">{kw}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Live Tracking Timeline */}
            {!isCancelled && (
              <div className="glass rounded-2xl p-6">
                <h3 className="text-white font-bold mb-5 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sky-400" /> Live Tracking
                  {['accepted','picked','in_transit'].includes(order.status) && (
                    <span className="flex items-center gap-1 text-xs text-sky-400">
                      <span className="w-1.5 h-1.5 bg-sky-400 rounded-full pulse-dot" /> Live
                    </span>
                  )}
                </h3>
                <div>
                  {STEPS.map((step, i) => {
                    const Icon  = step.icon;
                    const done  = i <= currentStep;
                    const active = i === currentStep;
                    const hist  = order.statusHistory?.find(s => s.status === step.key);
                    return (
                      <div key={step.key} className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all
                            ${active ? 'bg-sky-500 neon-blue' : done ? 'bg-green-500/20 border border-green-500/30' : 'bg-white/5 border border-white/10'}`}>
                            <Icon className={`w-4 h-4 ${active ? 'text-white' : done ? 'text-green-400' : 'text-slate-600'}`} />
                          </div>
                          {i < STEPS.length - 1 && (
                            <div className={`w-0.5 h-8 mt-1 ${done ? 'bg-green-500/30' : 'bg-white/5'}`} />
                          )}
                        </div>
                        <div className="pt-1.5 pb-6">
                          <p className={`font-semibold text-sm ${active ? 'text-sky-400' : done ? 'text-white' : 'text-slate-600'}`}>
                            {step.label}
                          </p>
                          {hist && <p className="text-slate-600 text-xs mt-0.5">{new Date(hist.timestamp).toLocaleString()}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Map Placeholder */}
            {['accepted','picked','in_transit'].includes(order.status) && (
              <div className="glass rounded-2xl p-6">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-sky-400" /> Delivery Map
                </h3>
                <div className="map-placeholder rounded-xl h-48 flex items-center justify-center relative">
                  <div className="text-center z-10">
                    <div className="w-12 h-12 rounded-full bg-sky-500/20 border-2 border-sky-500/40 flex items-center justify-center mx-auto mb-3">
                      <Navigation className="w-6 h-6 text-sky-400" />
                    </div>
                    <p className="text-slate-400 font-medium text-sm">Live GPS Tracking</p>
                    <p className="text-slate-600 text-xs mt-1">Integrate Google Maps API key in frontend/.env</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="glass rounded-2xl p-5">
              <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wide">Delivery Info</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-slate-600 text-xs mb-1 uppercase tracking-wide">Deliver To</p>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                    <p className="text-slate-300 text-sm">{order.deliveryAddress}</p>
                  </div>
                </div>
                {order.user && (
                  <div>
                    <p className="text-slate-600 text-xs mb-1 uppercase tracking-wide">Customer</p>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-sky-400" />
                      <p className="text-slate-300 text-sm">{order.user.name}</p>
                    </div>
                    {order.user.phone && (
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="w-4 h-4 text-sky-400" />
                        <p className="text-slate-300 text-sm">{order.user.phone}</p>
                      </div>
                    )}
                  </div>
                )}
                {order.deliveryPartner && (
                  <div className="pt-3 border-t border-white/5">
                    <p className="text-slate-600 text-xs mb-2 uppercase tracking-wide">Delivery Partner</p>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <User className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-emerald-400 text-sm font-semibold">{order.deliveryPartner.name}</p>
                        {order.deliveryPartner.phone && <p className="text-slate-500 text-xs">{order.deliveryPartner.phone}</p>}
                      </div>
                    </div>
                  </div>
                )}
                <div className="pt-3 border-t border-white/5">
                  <p className="text-slate-600 text-xs mb-1 uppercase tracking-wide">Ordered At</p>
                  <p className="text-slate-300 text-sm">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                {order.estimatedDelivery && (
                  <div>
                    <p className="text-slate-600 text-xs mb-1 uppercase tracking-wide">ETA</p>
                    <p className="text-sky-400 text-sm font-semibold">{new Date(order.estimatedDelivery).toLocaleTimeString()}</p>
                  </div>
                )}
                {order.actualDelivery && (
                  <div>
                    <p className="text-slate-600 text-xs mb-1 uppercase tracking-wide">Delivered At</p>
                    <p className="text-green-400 text-sm font-semibold">{new Date(order.actualDelivery).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>

            {order.prescriptionImage && (
              <div className="glass rounded-2xl p-5">
                <h3 className="text-white font-bold mb-3 text-sm flex items-center gap-2">
                  <Image className="w-4 h-4 text-sky-400" /> Prescription
                </h3>
                <a href={order.prescriptionImage} target="_blank" rel="noopener noreferrer"
                  className="block rounded-xl overflow-hidden border border-white/10 hover:border-sky-500/30 transition-colors">
                  <img src={order.prescriptionImage} alt="Prescription" className="w-full h-40 object-cover" />
                </a>
                <p className="text-slate-600 text-xs mt-2 text-center">Click to view full size</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
