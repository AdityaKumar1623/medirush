import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Package, Clock, CheckCircle, AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/shared/Navbar';
import OrderCard from '../components/dashboard/OrderCard';
import NewOrderModal from '../components/dashboard/NewOrderModal';
import { StatCard, LoadingSkeleton, EmptyState } from '../components/shared/Badges';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../utils/api';

const UserDashboard = () => {
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter]   = useState('all');

  const fetchOrders = useCallback(async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data.orders);
    } catch (err) {
      toast.error('Failed to load orders: ' + (err?.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Real-time order status updates via Socket.io
  useEffect(() => {
    if (!socket) return;

    // Join room for each order
    orders.forEach(o => socket.emit('join_order', o._id));

    const handleUpdate = ({ orderId, status, note }) => {
      setOrders(prev => prev.map(o =>
        o._id === orderId ? { ...o, status } : o
      ));
      toast.success(`Order ${status.replace('_', ' ').toUpperCase()}${note ? ': ' + note : ''}`, { icon: '📦' });
    };

    socket.on('order_update', handleUpdate);
    return () => {
      socket.off('order_update', handleUpdate);
    };
  }, [socket, orders]);

  const handleOrderCreated = (newOrder) => {
    setOrders(prev => [newOrder, ...prev]);
    // Join real-time room for the new order
    if (socket) socket.emit('join_order', newOrder._id);
  };

  const stats = {
    total:     orders.length,
    pending:   orders.filter(o => o.status === 'pending').length,
    active:    orders.filter(o => ['accepted','picked','in_transit'].includes(o.status)).length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    critical:  orders.filter(o => o.urgencyLevel === 'critical').length,
  };

  const filtered = filter === 'all' ? orders
    : filter === 'active' ? orders.filter(o => ['accepted','picked','in_transit'].includes(o.status))
    : orders.filter(o => o.status === filter);

  const FILTERS = [
    { key: 'all',       label: `All (${orders.length})` },
    { key: 'pending',   label: `Pending (${stats.pending})` },
    { key: 'active',    label: `Active (${stats.active})` },
    { key: 'delivered', label: `Delivered (${stats.delivered})` },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1527 100%)' }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black text-white">Hey, {user?.name?.split(' ')[0]} 👋</h1>
            <p className="text-slate-500 mt-1 flex items-center gap-2">
              {connected
                ? <><Wifi className="w-3.5 h-3.5 text-green-400" /><span className="text-green-400 text-xs font-medium">Live</span></>
                : <><WifiOff className="w-3.5 h-3.5 text-red-400" /><span className="text-red-400 text-xs font-medium">Reconnecting...</span></>
              }
              <span>Real-time order tracking</span>
            </p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white px-6 py-3 rounded-xl font-bold transition-all hover:shadow-lg hover:shadow-sky-500/25 hover:-translate-y-0.5">
            <Plus className="w-5 h-5" /> New Order
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Package}      label="Total Orders" value={stats.total}     color="sky" />
          <StatCard icon={Clock}        label="Pending"      value={stats.pending}   color="yellow" />
          <StatCard icon={CheckCircle}  label="Delivered"    value={stats.delivered} color="green" />
          <StatCard icon={AlertCircle}  label="Critical"     value={stats.critical}  color="red" />
        </div>

        {/* Active orders banner */}
        {stats.active > 0 && (
          <div className="mb-6 rounded-2xl bg-sky-500/10 border border-sky-500/20 p-4 flex items-center gap-3">
            <span className="w-3 h-3 bg-sky-400 rounded-full pulse-dot flex-shrink-0" />
            <p className="text-sky-300 font-medium text-sm">
              <span className="font-black">{stats.active}</span> order{stats.active > 1 ? 's' : ''} in progress — tracking live
            </p>
          </div>
        )}

        {/* Orders */}
        <div className="glass rounded-3xl p-6">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <h2 className="text-lg font-black text-white">Your Orders</h2>
            <div className="flex items-center gap-2">
              <div className="flex gap-1 bg-white/5 rounded-xl p-1">
                {FILTERS.map(f => (
                  <button key={f.key} onClick={() => setFilter(f.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f.key ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'}`}>
                    {f.label}
                  </button>
                ))}
              </div>
              <button onClick={fetchOrders} className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors" title="Refresh">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {loading ? <LoadingSkeleton rows={3} /> : filtered.length === 0 ? (
            <EmptyState icon={Package} title="No orders found"
              desc={filter === 'all' ? 'Place your first order!' : `No ${filter} orders`}
              action={filter === 'all' && (
                <button onClick={() => setShowModal(true)}
                  className="bg-sky-500 hover:bg-sky-400 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors">
                  Place First Order
                </button>
              )}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map(order => <OrderCard key={order._id} order={order} />)}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <NewOrderModal
          onClose={() => setShowModal(false)}
          onCreated={handleOrderCreated}
        />
      )}
    </div>
  );
};

export default UserDashboard;
