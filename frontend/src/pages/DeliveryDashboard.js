import React, { useState, useEffect, useCallback } from 'react';
import { Truck, Package, CheckCircle, Clock, RefreshCw, MapPin, Phone, Navigation, Wifi, WifiOff, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/shared/Navbar';
import { StatCard, LoadingSkeleton, StatusBadge, UrgencyBadge, PriorityBar, EmptyState } from '../components/shared/Badges';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const STATUS_FLOW = {
  accepted:   { next: 'picked',     label: '📦 Mark Picked Up',   color: 'purple' },
  picked:     { next: 'in_transit', label: '🚴 Mark In Transit',  color: 'cyan' },
  in_transit: { next: 'delivered',  label: '✅ Mark Delivered',   color: 'green' },
};

const DeliveryDashboard = () => {
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  const [available, setAvailable] = useState([]);
  const [myOrders, setMyOrders]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState('available');
  const [updating, setUpdating]   = useState(null);
  const [accepting, setAccepting] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [avRes, myRes] = await Promise.all([
        api.get('/delivery/available'),
        api.get('/delivery/my-orders'),
      ]);
      setAvailable(avRes.data.orders);
      setMyOrders(myRes.data.orders);
    } catch (err) {
      toast.error('Failed to load: ' + (err?.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Real-time: new orders broadcast from backend
  useEffect(() => {
    if (!socket) return;
    const onNewOrder = (order) => {
      setAvailable(prev => {
        if (prev.find(o => o._id === order._id)) return prev;
        toast('🚨 New order nearby!', { icon: '📦' });
        return [order, ...prev].sort((a, b) => b.priorityScore - a.priorityScore);
      });
    };
    const onOrderUpdate = ({ orderId, status }) => {
      setMyOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
    };
    socket.on('new_order', onNewOrder);
    socket.on('order_update', onOrderUpdate);
    return () => {
      socket.off('new_order', onNewOrder);
      socket.off('order_update', onOrderUpdate);
    };
  }, [socket]);

  const accept = async (orderId) => {
    setAccepting(orderId);
    try {
      const res = await api.post(`/delivery/${orderId}/accept`);
      setAvailable(prev => prev.filter(o => o._id !== orderId));
      setMyOrders(prev => [res.data.order, ...prev]);
      setTab('active');
      toast.success('Order accepted! Head to pharmacy 🏃');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to accept');
    } finally {
      setAccepting(null);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      const res = await api.put(`/delivery/${orderId}/status`, { status: newStatus });
      setMyOrders(prev => prev.map(o => o._id === orderId ? res.data.order : o));
      toast.success(`Status updated: ${newStatus.replace('_', ' ').toUpperCase()} ✓`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  const activeOrders    = myOrders.filter(o => ['accepted','picked','in_transit'].includes(o.status));
  const completedOrders = myOrders.filter(o => o.status === 'delivered');

  const TABS = [
    { key: 'available', label: `Available (${available.length})` },
    { key: 'active',    label: `Active (${activeOrders.length})` },
    { key: 'completed', label: `Completed (${completedOrders.length})` },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1527 100%)' }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black text-white">Delivery Hub</h1>
            <p className="text-slate-500 mt-1 flex items-center gap-2">
              {connected
                ? <><Wifi className="w-3.5 h-3.5 text-green-400" /><span className="text-green-400 text-xs font-medium">Live</span></>
                : <><WifiOff className="w-3.5 h-3.5 text-red-400" /><span className="text-red-400 text-xs font-medium">Reconnecting...</span></>
              }
              <span>New orders appear instantly</span>
            </p>
          </div>
          <button onClick={fetchData}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Package}     label="Available"       value={available.length}       color="sky" />
          <StatCard icon={Truck}       label="Active"          value={activeOrders.length}    color="purple" />
          <StatCard icon={CheckCircle} label="Completed Today" value={completedOrders.length} color="green" />
          <StatCard icon={Clock}       label="Critical Nearby" value={available.filter(o => o.urgencyLevel === 'critical').length} color="red" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-6 w-fit">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.key ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? <LoadingSkeleton rows={4} /> : (
          <>
            {/* Available Orders */}
            {tab === 'available' && (
              available.length === 0 ? (
                <EmptyState icon={Package} title="No available orders" desc="New orders will appear here in real-time" />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {available.map(order => (
                    <div key={order._id} className="glass rounded-2xl p-5 card-hover animate-fade-in">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <UrgencyBadge level={order.urgencyLevel} />
                        {order.urgencyLevel === 'critical' && (
                          <span className="text-xs text-red-400 font-bold animate-pulse flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-red-400 rounded-full inline-block" /> URGENT
                          </span>
                        )}
                      </div>
                      <p className="text-white font-semibold text-sm mb-3 line-clamp-2">{order.medicines}</p>
                      <div className="mb-3">
                        <p className="text-xs text-slate-600 mb-1">Priority Score</p>
                        <PriorityBar score={order.priorityScore} />
                      </div>
                      <div className="space-y-1.5 mb-4">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
                          <span className="text-xs text-slate-400 line-clamp-2">{order.deliveryAddress}</span>
                        </div>
                        {order.user?.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-xs text-slate-400">{order.user.phone}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setAvailable(prev => prev.filter(o => o._id !== order._id))}
                          className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 py-2 rounded-xl text-xs font-medium transition-colors">
                          Skip
                        </button>
                        <button onClick={() => accept(order._id)} disabled={accepting === order._id}
                          className={`flex-1 font-bold py-2 rounded-xl text-xs transition-all text-white flex items-center justify-center gap-1
                            ${order.urgencyLevel === 'critical'
                              ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400'
                              : 'bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400'}`}>
                          {accepting === order._id ? <Loader className="w-3.5 h-3.5 animate-spin" /> : 'Accept'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* Active Orders */}
            {tab === 'active' && (
              activeOrders.length === 0 ? (
                <EmptyState icon={Truck} title="No active deliveries" desc="Accept an order to start" />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {activeOrders.map(order => {
                    const flow = STATUS_FLOW[order.status];
                    return (
                      <div key={order._id} className="glass rounded-2xl p-5 card-hover">
                        <div className="flex items-center gap-2 mb-3">
                          <StatusBadge status={order.status} />
                          <UrgencyBadge level={order.urgencyLevel} />
                        </div>
                        <p className="text-white font-semibold text-sm mb-3 line-clamp-2">{order.medicines}</p>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
                            <span className="text-xs text-slate-400">{order.deliveryAddress}</span>
                          </div>
                          {(order.user?.phone || order.user?.name) && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-3.5 h-3.5 text-slate-500" />
                              <span className="text-xs text-slate-400">{order.user?.phone || order.user?.name}</span>
                            </div>
                          )}
                        </div>
                        {/* Map placeholder */}
                        <div className="map-placeholder rounded-xl h-24 flex items-center justify-center mb-4">
                          <div className="text-center z-10 relative">
                            <Navigation className="w-5 h-5 text-sky-400 mx-auto mb-1" />
                            <p className="text-slate-500 text-xs">GPS Tracking</p>
                          </div>
                        </div>
                        {flow && (
                          <button onClick={() => updateStatus(order._id, flow.next)}
                            disabled={updating === order._id}
                            className={`w-full bg-${flow.color}-500 hover:bg-${flow.color}-400 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2`}>
                            {updating === order._id ? <Loader className="w-4 h-4 animate-spin" /> : flow.label}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )
            )}

            {/* Completed Orders */}
            {tab === 'completed' && (
              completedOrders.length === 0 ? (
                <EmptyState icon={CheckCircle} title="No completed deliveries" desc="Completed deliveries will show here" />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {completedOrders.map(order => (
                    <div key={order._id} className="glass rounded-2xl p-5 opacity-80">
                      <div className="flex items-center gap-2 mb-3">
                        <StatusBadge status="delivered" />
                        <UrgencyBadge level={order.urgencyLevel} />
                      </div>
                      <p className="text-white font-semibold text-sm mb-2 line-clamp-2">{order.medicines}</p>
                      <p className="text-slate-500 text-xs flex items-center gap-1">
                        <MapPin className="w-3 h-3" />{order.deliveryAddress}
                      </p>
                      {order.actualDelivery && (
                        <p className="text-green-400 text-xs mt-2">
                          ✓ Delivered {new Date(order.actualDelivery).toLocaleString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DeliveryDashboard;
